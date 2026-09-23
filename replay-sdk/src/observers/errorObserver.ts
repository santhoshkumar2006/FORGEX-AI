import { RuntimeError } from '@safereplay/shared';
import { PrivacyMasker } from '../privacy/masker';

export type ErrorEmitCallback = (error: RuntimeError) => void;

export class ErrorObserver {
  private sessionId: string;
  private masker: PrivacyMasker;
  private onEmit: ErrorEmitCallback;
  private isListening = false;

  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  constructor(sessionId: string, masker: PrivacyMasker, onEmit: ErrorEmitCallback) {
    this.sessionId = sessionId;
    this.masker = masker;
    this.onEmit = onEmit;
  }

  public start() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    this.errorHandler = (event: ErrorEvent) => {
      const { message, filename, lineno, colno, error } = event;
      const { message: safeMsg, stack: safeStack } = this.masker.sanitizeError(
        message || (error && error.message) || 'Unknown runtime error',
        error && error.stack
      );

      const parsedFile = filename ? filename.split('/').pop()?.split('\\').pop() || filename : 'unknown.ts';

      const runtimeError: RuntimeError = {
        sessionId: this.sessionId,
        type: 'runtime_error',
        message: safeMsg,
        file: parsedFile,
        line: lineno || 0,
        column: colno || 0,
        function: this.extractFunctionName(error?.stack),
        stack: safeStack,
        page: (typeof window !== 'undefined' && window.location.pathname) || '/',
        timestamp: new Date().toISOString()
      };

      this.onEmit(runtimeError);
    };

    this.rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const rawMsg = reason instanceof Error ? reason.message : String(reason || 'Unhandled Promise Rejection');
      const rawStack = reason instanceof Error ? reason.stack : '';

      const { message: safeMsg, stack: safeStack } = this.masker.sanitizeError(rawMsg, rawStack);

      const runtimeError: RuntimeError = {
        sessionId: this.sessionId,
        type: 'runtime_error',
        message: safeMsg,
        file: 'async-task.ts',
        line: 0,
        column: 0,
        function: 'PromiseRejection',
        stack: safeStack,
        page: (typeof window !== 'undefined' && window.location.pathname) || '/',
        timestamp: new Date().toISOString()
      };

      this.onEmit(runtimeError);
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);
  }

  public stop() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
      this.errorHandler = null;
    }
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
      this.rejectionHandler = null;
    }
  }

  private extractFunctionName(stack?: string): string {
    if (!stack) return 'anonymous';
    const lines = stack.split('\n');
    if (lines.length > 1) {
      const match = lines[1].match(/at\s+([^\s(]+)/);
      if (match && match[1]) return match[1];
    }
    return 'anonymous';
  }
}
