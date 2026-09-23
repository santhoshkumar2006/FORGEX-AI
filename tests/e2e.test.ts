import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/server';
import { SafeReplaySDK } from '../replay-sdk/src';

describe('SafeReplay End-to-End Integration Test Suite', () => {
  const SESSION_ID = 'SR-E2E-TEST-1042';

  it('runs complete end-to-end reproduction, privacy masking, AI analysis & fix verification', async () => {
    // 1. Initialize Replay SDK for the user journey
    const sdk = new SafeReplaySDK({
      sessionId: SESSION_ID,
      uploadUrl: '/api/sessions/events',
      enabled: true
    });
    sdk.start();

    // 2. User browses products
    const productsRes = await request(app).get('/api/products');
    expect(productsRes.status).toBe(200);
    const selectedProduct = productsRes.body.products[0];

    // 3. User adds product to cart
    sdk.recordEvent({
      type: 'click',
      page: '/',
      data: { action: 'add_to_cart', productId: selectedProduct.id, name: selectedProduct.name }
    });

    // 4. User navigates to checkout
    sdk.recordEvent({
      type: 'route_change',
      page: '/checkout',
      data: { url: '/checkout' }
    });

    // 5. User submits checkout with synthetic customer data
    const syntheticPayload = {
      name: 'Synthetic Alex Doe',
      email: 'alex.doe@example.synthetic',
      phone: '9876543210', // Fake phone
      address: '100 Innovation Way, Tech Park', // Trigger controlled error at line 48
      sessionId: SESSION_ID
    };

    const checkoutRes = await request(app)
      .post('/api/customer-details')
      .send(syntheticPayload);

    // 6. Verify controlled failure
    expect(checkoutRes.status).toBe(500);
    expect(checkoutRes.body.saved).toBe(false);
    expect(checkoutRes.body.reason).toContain('Database transaction rolled back');

    // 7. Verify SDK privacy report guarantees ZERO PII leaked
    const privacyReport = sdk.getPrivacyReport();
    expect(privacyReport.status).toBe('SAFE');
    expect(privacyReport.sensitiveValuesUploaded).toBe(0);
    expect(privacyReport.tokensUploaded).toBe(0);

    // 8. Upload batched session events to backend
    const uploadRes = await request(app)
      .post('/api/sessions/events')
      .send({
        sessionId: SESSION_ID,
        events: [
          {
            sessionId: SESSION_ID,
            type: 'click',
            page: '/',
            timestamp: new Date().toISOString(),
            data: { action: 'add_to_cart' }
          },
          {
            sessionId: SESSION_ID,
            type: 'click',
            page: '/checkout',
            timestamp: new Date().toISOString(),
            data: { label: 'Submit Order' }
          }
        ],
        privacyReport
      });
    expect(uploadRes.status).toBe(200);

    // 9. Developer opens dashboard to inspect session
    const sessionDetailsRes = await request(app).get(`/api/sessions/${SESSION_ID}`);
    expect(sessionDetailsRes.status).toBe(200);
    expect(sessionDetailsRes.body.session.hasError).toBe(true);
    expect(sessionDetailsRes.body.session.dbStatus).toBe('failed');
    expect(sessionDetailsRes.body.errors[0].line).toBe(48);
    expect(sessionDetailsRes.body.errors[0].file).toBe('CustomerDetailsService.ts');

    // 10. Developer runs AI Root-Cause Analysis
    const aiRes = await request(app)
      .post('/api/analyze-error')
      .send({
        sessionId: SESSION_ID,
        file: 'CustomerDetailsService.ts',
        line: 48
      });
    expect(aiRes.status).toBe(200);
    expect(aiRes.body.analysis.confidence).toBeGreaterThan(0.8);
    expect(aiRes.body.analysis.requiresReview).toBe(true);
    expect(aiRes.body.analysis.correctedCode).toContain('customer.address?.postalCode?.toUpperCase()');

    // 11. Developer runs Fix Verification in isolated runner
    const verifyRes = await request(app)
      .post('/api/verify-fix')
      .send({ sessionId: SESSION_ID });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.verification.verificationMessage).toBe(
      'Passed for the captured reproduction scenario.'
    );
    expect(verifyRes.body.verification.correctedScenario.testStatus).toBe('passed');
    expect(verifyRes.body.verification.correctedScenario.errorReproduced).toBe(false);

    sdk.stop();
  });
});
