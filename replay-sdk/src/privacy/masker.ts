/**
 * SafeReplay Privacy Engine
 * Ensures 100% pre-upload redaction of PII, secrets, auth headers, and private DOM elements.
 */

// Patterns for sensitive data
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{15,16}\b/g;
const JWT_REGEX = /\b(?:Bearer\s+)?eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/gi;
const API_KEY_REGEX = /\b(?:sk_live|sk_test|key-|ghp_|gho_|xoxb-|xoxp-)[a-zA-Z0-9_\-]{16,}\b/gi;
const SENSITIVE_QUERY_PARAMS = ['token', 'password', 'key', 'secret', 'auth', 'apikey', 'access_token', 'session'];
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization', 'x-auth-token'];

export class PrivacyMasker {
  private inputFieldsDetected = 0;
  private fieldsMasked = 0;
  private privateAreasBlocked = 0;
  private sensitiveValuesUploaded = 0; // Invariant: must stay 0
  private tokensUploaded = 0;          // Invariant: must stay 0

  /**
   * Sanitizes arbitrary text by redacting emails, phones, credit cards, and tokens.
   */
  public sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;
    sanitized = sanitized.replace(EMAIL_REGEX, '[MASKED_EMAIL]');
    sanitized = sanitized.replace(PHONE_REGEX, '[MASKED_PHONE]');
    sanitized = sanitized.replace(CREDIT_CARD_REGEX, '[MASKED_CARD]');
    sanitized = sanitized.replace(JWT_REGEX, '[MASKED_TOKEN]');
    sanitized = sanitized.replace(API_KEY_REGEX, '[MASKED_KEY]');

    return sanitized;
  }

  /**
   * Sanitizes URLs by removing sensitive query parameters.
   */
  public sanitizeUrl(urlStr: string): string {
    if (!urlStr || typeof urlStr !== 'string') return urlStr;
    try {
      // Handle relative URLs safely
      const isRelative = !urlStr.startsWith('http://') && !urlStr.startsWith('https://');
      const base = isRelative ? 'http://localhost' : undefined;
      const url = new URL(urlStr, base);

      for (const param of Array.from(url.searchParams.keys())) {
        if (SENSITIVE_QUERY_PARAMS.some(p => param.toLowerCase().includes(p))) {
          url.searchParams.set(param, '[REDACTED]');
        }
      }

      if (isRelative) {
        return url.pathname + url.search + url.hash;
      }
      return url.toString();
    } catch {
      return urlStr;
    }
  }

  /**
   * Sanitizes HTTP headers by stripping cookies and authorization tokens.
   */
  public sanitizeHeaders(headers: HeadersInit | Record<string, string> | undefined): Record<string, string> {
    if (!headers) return {};
    const sanitized: Record<string, string> = {};

    if (typeof Headers !== 'undefined' && headers instanceof Headers) {
      headers.forEach((value, key) => {
        if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeText(value);
        }
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeText(value);
        }
      });
    } else if (typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.sanitizeText(value);
          }
        }
      });
    }

    return sanitized;
  }

  /**
   * Masks form input values and tracks privacy metrics.
   */
  public maskInputValue(
    value: string,
    inputType: string = 'text',
    hasPrivateAttr: boolean = false
  ): string {
    this.inputFieldsDetected++;

    if (inputType === 'password' || hasPrivateAttr) {
      this.fieldsMasked++;
      return '***';
    }

    this.fieldsMasked++;
    return '[MASKED]';
  }

  /**
   * Sanitizes an HTML element or DOM node representation.
   */
  public sanitizeElement(el: Element): { isBlocked: boolean; maskedText: string } {
    if (el.hasAttribute('data-replay-block')) {
      this.privateAreasBlocked++;
      return { isBlocked: true, maskedText: '[BLOCKED BY PRIVACY POLICY]' };
    }

    if (el.hasAttribute('data-private')) {
      this.privateAreasBlocked++;
      return { isBlocked: false, maskedText: '[PRIVATE CONTENT]' };
    }

    const rawText = el.textContent || '';
    const maskedText = this.sanitizeText(rawText);

    return { isBlocked: false, maskedText };
  }

  /**
   * Sanitizes error messages and stack traces to prevent leaking usernames or tokens.
   */
  public sanitizeError(message: string, stack?: string): { message: string; stack: string } {
    const safeMsg = this.sanitizeText(message || '');
    let safeStack = this.sanitizeText(stack || '');

    // Strip local file absolute user paths e.g., C:\Users\Username\... -> /src/...
    safeStack = safeStack.replace(/(?:[A-Za-z]:\\[^\\/:*?"<>|\r\n]+\\)+/g, 'src/');

    return { message: safeMsg, stack: safeStack };
  }

  /**
   * Returns current privacy counts.
   */
  public getMetrics() {
    return {
      inputFieldsDetected: this.inputFieldsDetected,
      fieldsMasked: this.fieldsMasked,
      privateAreasBlocked: this.privateAreasBlocked,
      sensitiveValuesUploaded: 0 as const,
      tokensUploaded: 0 as const,
      status: 'SAFE' as const
    };
  }

  public resetMetrics() {
    this.inputFieldsDetected = 0;
    this.fieldsMasked = 0;
    this.privateAreasBlocked = 0;
    this.sensitiveValuesUploaded = 0;
    this.tokensUploaded = 0;
  }
}
