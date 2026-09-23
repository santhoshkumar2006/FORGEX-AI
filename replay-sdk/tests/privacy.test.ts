import { describe, it, expect, beforeEach } from 'vitest';
import { PrivacyMasker } from '../src/privacy/masker';

describe('PrivacyMasker Test Suite', () => {
  let masker: PrivacyMasker;

  beforeEach(() => {
    masker = new PrivacyMasker();
  });

  it('redacts sensitive email addresses', () => {
    const raw = 'Customer contact is test@example.com for order confirmation';
    const sanitized = masker.sanitizeText(raw);
    expect(sanitized).not.toContain('test@example.com');
    expect(sanitized).toContain('[MASKED_EMAIL]');
  });

  it('redacts phone numbers', () => {
    const raw1 = 'Call customer at 9876543210 immediately';
    const raw2 = 'Call customer at 555-123-4567';
    expect(masker.sanitizeText(raw1)).not.toContain('9876543210');
    expect(masker.sanitizeText(raw1)).toContain('[MASKED_PHONE]');
    expect(masker.sanitizeText(raw2)).not.toContain('555-123-4567');
  });

  it('redacts credit card numbers', () => {
    const raw = 'Processing card 4111-2222-3333-4444 for payment';
    const sanitized = masker.sanitizeText(raw);
    expect(sanitized).not.toContain('4111-2222-3333-4444');
    expect(sanitized).toContain('[MASKED_CARD]');
  });

  it('redacts JWT tokens and API keys', () => {
    const rawJwt = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature';
    const rawApiKey = 'Using API Key sk_live_abcdef1234567890abcdef for auth';

    expect(masker.sanitizeText(rawJwt)).not.toContain('doNotLeakThisSignature');
    expect(masker.sanitizeText(rawJwt)).toContain('[MASKED_TOKEN]');
    expect(masker.sanitizeText(rawApiKey)).not.toContain('sk_live_abcdef1234567890abcdef');
    expect(masker.sanitizeText(rawApiKey)).toContain('[MASKED_KEY]');
  });

  it('sanitizes sensitive URL query parameters', () => {
    const url = 'https://example.com/checkout?token=secret123&user=john&password=supersecret&safeParam=123';
    const sanitized = masker.sanitizeUrl(url);

    expect(sanitized).not.toContain('secret123');
    expect(sanitized).not.toContain('supersecret');
    expect(sanitized).toContain('token=%5BREDACTED%5D');
    expect(sanitized).toContain('safeParam=123');
  });

  it('sanitizes authorization and cookie headers', () => {
    const headers = {
      'Authorization': 'Bearer secret-jwt-token',
      'Cookie': 'sessionId=abc123secret; auth=true',
      'Content-Type': 'application/json',
      'X-API-Key': 'key-9876543210secret'
    };

    const sanitized = masker.sanitizeHeaders(headers);
    expect(sanitized['Authorization']).toBe('[REDACTED]');
    expect(sanitized['Cookie']).toBe('[REDACTED]');
    expect(sanitized['X-API-Key']).toBe('[REDACTED]');
    expect(sanitized['Content-Type']).toBe('application/json');
  });

  it('masks input field values based on type and privacy attributes', () => {
    const textMasked = masker.maskInputValue('John Doe', 'text', false);
    expect(textMasked).toBe('[MASKED]');

    const passwordMasked = masker.maskInputValue('MyPassword123!', 'password', false);
    expect(passwordMasked).toBe('***');

    const privateAttrMasked = masker.maskInputValue('123 Main St', 'text', true);
    expect(privateAttrMasked).toBe('***');
  });

  it('guarantees 0 sensitive values and tokens uploaded metric', () => {
    masker.maskInputValue('John Doe', 'text');
    masker.maskInputValue('password123', 'password');
    const metrics = masker.getMetrics();

    expect(metrics.inputFieldsDetected).toBe(2);
    expect(metrics.fieldsMasked).toBe(2);
    expect(metrics.sensitiveValuesUploaded).toBe(0);
    expect(metrics.tokensUploaded).toBe(0);
    expect(metrics.status).toBe('SAFE');
  });
});
