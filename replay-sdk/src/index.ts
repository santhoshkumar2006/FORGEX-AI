import { ReplayConfig, AnyReplayEvent } from './types';
import { PrivacyMasker } from './privacy/masker';
import { ReportCollector } from './reports/reportCollector';
import { DOMObserver } from './observers/domObserver';
import { ErrorObserver } from './observers/errorObserver';
import { PerfObserver } from './observers/performanceObserver';
import { FetchInterceptor } from './network/fetchInterceptor';
import { BatchUploader } from './queue/batchUploader';
import { SessionEvent, PrivacyReport, PerformanceReport } from '@safereplay/shared';

export * from './types';
export * from './privacy/masker';
export * from './reports/reportCollector';

export class SafeReplaySDK {
  private config: ReplayConfig;
  private masker: PrivacyMasker;
  private collector: ReportCollector;
  private uploader: BatchUploader;
  private domObserver: DOMObserver;
  private errorObserver: ErrorObserver;
  private perfObserver: PerfObserver;
  private fetchInterceptor: FetchInterceptor;
  private isActive = false;

  constructor(config: ReplayConfig) {
    this.config = {
      enabled: true,
      maskInputs: true,
      debug: false,
      batchIntervalMs: 1500,
      maxBatchSize: 20,
      ...config
    };

    this.masker = new PrivacyMasker();
    this.collector = new ReportCollector(this.config.sessionId, this.masker);
    this.uploader = new BatchUploader(this.config, this.collector);

    const emitEvent = (event: AnyReplayEvent) => {
      this.uploader.enqueue(event);
    };

    this.domObserver = new DOMObserver(this.config.sessionId, this.masker, (evt) => {
      const fullEvent: SessionEvent = {
        sessionId: this.config.sessionId,
        type: evt.type || 'custom',
        timestamp: evt.timestamp || new Date().toISOString(),
        page: evt.page || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        data: evt.data || {}
      };
      emitEvent(fullEvent);
    });

    this.errorObserver = new ErrorObserver(this.config.sessionId, this.masker, emitEvent);
    this.perfObserver = new PerfObserver(this.collector);
    this.fetchInterceptor = new FetchInterceptor(
      this.config.sessionId,
      this.masker,
      emitEvent,
      emitEvent
    );
  }

  public start() {
    if (this.isActive || this.config.enabled === false) return;
    this.isActive = true;

    this.domObserver.start();
    this.errorObserver.start();
    this.perfObserver.start();
    this.fetchInterceptor.start();

    // Record session start event
    this.recordEvent({
      sessionId: this.config.sessionId,
      type: 'session_start',
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: new Date().toISOString(),
      data: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080'
      }
    });

    if (this.config.debug) {
      console.log(`[SafeReplay] SDK initialized for session: ${this.config.sessionId}`);
    }
  }

  public stop() {
    if (!this.isActive) return;
    this.isActive = false;

    this.recordEvent({
      sessionId: this.config.sessionId,
      type: 'session_end',
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      timestamp: new Date().toISOString(),
      data: { reason: 'session_completed' }
    });

    this.domObserver.stop();
    this.errorObserver.stop();
    this.perfObserver.stop();
    this.fetchInterceptor.stop();
    this.uploader.stop();
  }

  public recordEvent(event: Partial<SessionEvent>) {
    const fullEvent: SessionEvent = {
      sessionId: this.config.sessionId,
      type: event.type || 'custom',
      timestamp: event.timestamp || new Date().toISOString(),
      page: event.page || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      data: event.data || {}
    };
    this.uploader.enqueue(fullEvent);
  }

  public getPrivacyReport(): PrivacyReport {
    return this.collector.getPrivacyReport();
  }

  public getPerformanceReport(): PerformanceReport {
    return this.collector.getPerformanceReport();
  }

  public flush(): Promise<void> {
    return this.uploader.flush();
  }
}

let activeInstance: SafeReplaySDK | null = null;

export function startReplay(config: ReplayConfig): SafeReplaySDK {
  if (activeInstance) {
    activeInstance.stop();
  }
  activeInstance = new SafeReplaySDK(config);
  activeInstance.start();
  return activeInstance;
}

export function stopReplay(): void {
  if (activeInstance) {
    activeInstance.stop();
    activeInstance = null;
  }
}

export function recordEvent(event: Partial<SessionEvent>): void {
  if (activeInstance) {
    activeInstance.recordEvent(event);
  }
}

export function getPrivacyReport(): PrivacyReport | null {
  return activeInstance ? activeInstance.getPrivacyReport() : null;
}

export function getPerformanceReport(): PerformanceReport | null {
  return activeInstance ? activeInstance.getPerformanceReport() : null;
}
