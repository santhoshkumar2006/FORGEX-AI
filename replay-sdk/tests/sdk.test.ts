import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SafeReplaySDK } from '../src';

describe('SafeReplay SDK Core Engine', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as any);
  });

  it('initializes session and generates safe privacy & performance reports', () => {
    const sdk = new SafeReplaySDK({
      sessionId: 'SR-1042',
      uploadUrl: '/api/sessions/events',
      enabled: true
    });

    sdk.start();

    // Record sample user journey events
    sdk.recordEvent({
      type: 'click',
      page: '/products',
      data: { target: 'button#add-to-cart', product: 'Wireless Headphones' }
    });

    sdk.recordEvent({
      type: 'route_change',
      page: '/checkout',
      data: { url: '/checkout' }
    });

    const privacyReport = sdk.getPrivacyReport();
    expect(privacyReport.sessionId).toBe('SR-1042');
    expect(privacyReport.status).toBe('SAFE');
    expect(privacyReport.sensitiveValuesUploaded).toBe(0);
    expect(privacyReport.tokensUploaded).toBe(0);

    const perfReport = sdk.getPerformanceReport();
    expect(perfReport.sessionId).toBe('SR-1042');
    expect(perfReport.eventCount).toBeGreaterThan(0);

    sdk.stop();
  });

  it('batches and uploads events safely', async () => {
    const sdk = new SafeReplaySDK({
      sessionId: 'SR-1042',
      uploadUrl: '/api/sessions/events',
      batchIntervalMs: 100,
      enabled: true
    });

    sdk.recordEvent({ type: 'click', page: '/cart' });
    await sdk.flush();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/sessions/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );

    sdk.stop();
  });
});
