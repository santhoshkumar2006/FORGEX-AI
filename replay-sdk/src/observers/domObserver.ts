import { PrivacyMasker } from '../privacy/masker';
import { SessionEvent } from '@safereplay/shared';

export type EventEmitCallback = (event: Partial<SessionEvent>) => void;

export class DOMObserver {
  private sessionId: string;
  private masker: PrivacyMasker;
  private onEmit: EventEmitCallback;
  private mutationObserver: MutationObserver | null = null;
  private isListening = false;

  constructor(sessionId: string, masker: PrivacyMasker, onEmit: EventEmitCallback) {
    this.sessionId = sessionId;
    this.masker = masker;
    this.onEmit = onEmit;
  }

  public start() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    this.attachEventListeners();
    this.startMutationObserver();
    this.trackNavigation();
  }

  public stop() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  private attachEventListeners() {
    if (typeof document === 'undefined') return;

    // Safe Click Capture
    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const { isBlocked, maskedText } = this.masker.sanitizeElement(target);
      if (isBlocked) return;

      const tagName = target.tagName.toLowerCase();
      const id = target.id ? `#${target.id}` : '';
      const className = target.className && typeof target.className === 'string'
        ? `.${target.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`
        : '';

      this.onEmit({
        sessionId: this.sessionId,
        type: 'click',
        page: window.location.pathname || '/',
        data: {
          selector: `${tagName}${id}${className}`,
          label: this.masker.sanitizeText(target.innerText?.slice(0, 50) || target.getAttribute('aria-label') || tagName),
          role: target.getAttribute('role') || tagName
        }
      });
    }, true);

    // Safe Input Capture (Value is ALWAYS masked)
    document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target || !target.tagName) return;

      const isPassword = target.type === 'password';
      const hasPrivate = target.hasAttribute('data-private') || target.hasAttribute('data-replay-block');
      const inputName = target.name || target.id || target.getAttribute('aria-label') || 'input';

      const maskedVal = this.masker.maskInputValue(target.value || '', target.type || 'text', hasPrivate);

      this.onEmit({
        sessionId: this.sessionId,
        type: 'input',
        page: window.location.pathname || '/',
        data: {
          field: this.masker.sanitizeText(inputName),
          inputType: isPassword ? 'password' : 'text',
          maskedValue: maskedVal,
          valueLength: (target.value || '').length
        }
      });
    }, true);

    // Safe Form Submit Capture (No raw credentials)
    document.addEventListener('submit', (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (!form) return;

      const formId = form.id || form.name || 'form';
      const inputFields: string[] = [];

      Array.from(form.elements).forEach((elem: any) => {
        if (elem.name || elem.id) {
          inputFields.push(elem.name || elem.id);
        }
      });

      this.onEmit({
        sessionId: this.sessionId,
        type: 'form_submit',
        page: window.location.pathname || '/',
        data: {
          formId: this.masker.sanitizeText(formId),
          fieldsPresent: inputFields.map(f => this.masker.sanitizeText(f)),
          action: this.masker.sanitizeUrl(form.action || window.location.pathname)
        }
      });
    }, true);
  }

  private startMutationObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;

    this.mutationObserver = new MutationObserver((mutations) => {
      const simplifiedMutations = mutations.slice(0, 5).map((m) => {
        const target = m.target as HTMLElement;
        const targetName = target ? target.tagName?.toLowerCase() || 'node' : 'unknown';
        return {
          type: m.type,
          target: targetName,
          addedCount: m.addedNodes.length,
          removedCount: m.removedNodes.length
        };
      });

      if (simplifiedMutations.length > 0) {
        this.onEmit({
          sessionId: this.sessionId,
          type: 'dom_mutation',
          page: window.location.pathname || '/',
          data: {
            mutationCount: mutations.length,
            sample: simplifiedMutations
          }
        });
      }
    });

    this.mutationObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  private trackNavigation() {
    if (typeof window === 'undefined') return;

    const recordRoute = () => {
      this.onEmit({
        sessionId: this.sessionId,
        type: 'route_change',
        page: window.location.pathname || '/',
        data: {
          url: this.masker.sanitizeUrl(window.location.href),
          title: this.masker.sanitizeText(document.title)
        }
      });
    };

    window.addEventListener('popstate', recordRoute);
    window.addEventListener('hashchange', recordRoute);

    // Patch pushState and replaceState
    const origPushState = history.pushState;
    if (origPushState) {
      history.pushState = function(...args) {
        origPushState.apply(this, args);
        recordRoute();
      };
    }
  }
}
