import { NetworkEvent, DatabaseResult } from '@safereplay/shared';
import { PrivacyMasker } from '../privacy/masker';

export type NetworkEmitCallback = (event: NetworkEvent) => void;
export type DatabaseResultEmitCallback = (result: DatabaseResult) => void;

export class FetchInterceptor {
  private sessionId: string;
  private masker: PrivacyMasker;
  private onNetworkEmit: NetworkEmitCallback;
  private onDbEmit: DatabaseResultEmitCallback;
  private originalFetch: typeof fetch | null = null;
  private isInterceptionActive = false;

  constructor(
    sessionId: string,
    masker: PrivacyMasker,
    onNetworkEmit: NetworkEmitCallback,
    onDbEmit: DatabaseResultEmitCallback
  ) {
    this.sessionId = sessionId;
    this.masker = masker;
    this.onNetworkEmit = onNetworkEmit;
    this.onDbEmit = onDbEmit;
  }

  public start() {
    if (typeof window === 'undefined' || typeof window.fetch === 'undefined' || this.isInterceptionActive) return;
    this.isInterceptionActive = true;
    this.originalFetch = window.fetch.bind(window);

    const self = this;

    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const rawUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
      const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase() as any;

      const safeUrl = self.masker.sanitizeUrl(rawUrl);

      // Do not intercept SDK internal event upload traffic to avoid infinite loop
      if (rawUrl.includes('/api/sessions/events')) {
        return self.originalFetch!(input, init);
      }

      try {
        const response = await self.originalFetch!(input, init);
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const duration = Math.round(endTime - startTime);

        // Sanitize headers
        const sanitizedHeaders = self.masker.sanitizeHeaders(init?.headers);

        const networkEvent: NetworkEvent = {
          sessionId: self.sessionId,
          type: 'network',
          method,
          url: safeUrl,
          status: response.status,
          duration,
          page: (typeof window !== 'undefined' && window.location.pathname) || '/',
          timestamp: new Date().toISOString(),
          headers: sanitizedHeaders
        };

        self.onNetworkEmit(networkEvent);

        // Check if the response contains database metadata safely
        const clonedResponse = response.clone();
        clonedResponse.json().then((jsonBody) => {
          if (jsonBody && (jsonBody.databaseResult || jsonBody.reason || jsonBody.saved !== undefined)) {
            const dbStatus = jsonBody.saved === true || jsonBody.status === 'success' ? 'success' : 'failed';
            const dbResult: DatabaseResult = {
              sessionId: self.sessionId,
              type: 'database_result',
              operation: jsonBody.operation || (rawUrl.includes('customer-details') ? 'customer_details_insert' : 'db_transaction'),
              status: dbStatus,
              reason: jsonBody.reason ? self.masker.sanitizeText(jsonBody.reason) : (dbStatus === 'failed' ? 'Operation failed' : null),
              recordId: jsonBody.recordId || null,
              timestamp: new Date().toISOString()
            };
            self.onDbEmit(dbResult);
          }
        }).catch(() => {
          // Response was not JSON or already consumed
        });

        return response;
      } catch (error: any) {
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const duration = Math.round(endTime - startTime);

        const networkEvent: NetworkEvent = {
          sessionId: self.sessionId,
          type: 'network',
          method,
          url: safeUrl,
          status: 0,
          duration,
          page: (typeof window !== 'undefined' && window.location.pathname) || '/',
          timestamp: new Date().toISOString(),
          headers: self.masker.sanitizeHeaders(init?.headers)
        };

        self.onNetworkEmit(networkEvent);
        throw error;
      }
    };
  }

  public stop() {
    if (!this.isInterceptionActive) return;
    this.isInterceptionActive = false;

    if (this.originalFetch && typeof window !== 'undefined') {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }
}
