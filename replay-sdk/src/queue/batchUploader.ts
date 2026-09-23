import { AnyReplayEvent, ReplayConfig } from '../types';
import { ReportCollector } from '../reports/reportCollector';

export class BatchUploader {
  private config: ReplayConfig;
  private collector: ReportCollector;
  private queue: AnyReplayEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isUploading = false;
  private maxRetries = 3;

  constructor(config: ReplayConfig, collector: ReportCollector) {
    this.config = config;
    this.collector = collector;
    this.startPeriodicFlush();
  }

  public enqueue(event: AnyReplayEvent) {
    if (this.config.enabled === false) return;

    const eventJson = JSON.stringify(event);
    const sizeBytes = new TextEncoder().encode(eventJson).length;

    // Check payload size limit
    const maxPayload = this.config.maxPayloadSizeBytes || 1024 * 1024; // 1MB
    if (sizeBytes > maxPayload) {
      if (this.config.debug) {
        console.warn(`[SafeReplay] Dropping event exceeding size limit (${sizeBytes} > ${maxPayload})`);
      }
      return;
    }

    this.queue.push(event);
    this.collector.recordEventProcessed(sizeBytes, 0.2);

    if (this.config.debug) {
      console.log('[SafeReplay Event Queued]', event.type, event);
    }

    const maxBatchSize = this.config.maxBatchSize || 20;
    if (this.queue.length >= maxBatchSize) {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.queue.length === 0 || this.isUploading) return;

    const eventsToUpload = [...this.queue];
    this.queue = [];
    this.isUploading = true;

    try {
      await this.uploadWithRetry(eventsToUpload, 0);
    } catch (err) {
      if (this.config.debug) {
        console.error('[SafeReplay] Upload failed permanently after retries', err);
      }
      // Put events back in queue if not too big
      if (this.queue.length < 100) {
        this.queue = [...eventsToUpload, ...this.queue];
      }
    } finally {
      this.isUploading = false;
    }
  }

  private async uploadWithRetry(events: AnyReplayEvent[], retryCount: number): Promise<void> {
    const payload = {
      sessionId: this.config.sessionId,
      events,
      privacyReport: this.collector.getPrivacyReport(),
      performanceReport: this.collector.getPerformanceReport(),
      uploadedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(this.config.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Upload returned status ${response.status}`);
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 500;
        await new Promise((r) => setTimeout(r, delay));
        return this.uploadWithRetry(events, retryCount + 1);
      }
      throw error;
    }
  }

  private startPeriodicFlush() {
    const interval = this.config.batchIntervalMs || 2000;
    this.flushTimer = setInterval(() => {
      this.flush();
    }, interval);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.queue.length > 0 && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const payload = {
            sessionId: this.config.sessionId,
            events: this.queue,
            privacyReport: this.collector.getPrivacyReport(),
            performanceReport: this.collector.getPerformanceReport()
          };
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(this.config.uploadUrl, blob);
        }
      });
    }
  }

  public stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}
