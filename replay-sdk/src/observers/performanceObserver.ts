import { ReportCollector } from '../reports/reportCollector';

export class PerfObserver {
  private collector: ReportCollector;
  private observer: PerformanceObserver | null = null;
  private isListening = false;

  constructor(collector: ReportCollector) {
    this.collector = collector;
  }

  public start() {
    if (typeof PerformanceObserver === 'undefined' || this.isListening) return;
    this.isListening = true;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask' || entry.duration > 50) {
            this.collector.recordLongTask();
          }
        }
      });

      this.observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Longtask observer not supported in this browser environment
    }
  }

  public stop() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
