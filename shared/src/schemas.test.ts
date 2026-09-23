import { describe, it, expect } from 'vitest';
import {
  EventSchema,
  RuntimeErrorSchema,
  NetworkEventSchema,
  DatabaseResultSchema,
  PrivacyReportSchema,
  PerformanceReportSchema,
  AIResultSchema,
  userRoleSchema,
  userSchema,
  loginRequestSchema,
  authResponseSchema
} from './src';

describe('Shared Schemas Validation', () => {
  it('validates a valid SessionEvent', () => {
    const validEvent = {
      sessionId: 'SR-1042',
      type: 'click',
      timestamp: '2026-09-22T12:00:00.000Z',
      page: '/checkout',
      data: { target: 'button#pay-now' }
    };
    const parsed = EventSchema.parse(validEvent);
    expect(parsed.sessionId).toBe('SR-1042');
    expect(parsed.type).toBe('click');
  });

  it('validates a valid RuntimeError', () => {
    const validError = {
      sessionId: 'SR-1042',
      type: 'runtime_error',
      message: 'Cannot read properties of undefined (reading toUpperCase)',
      file: 'CustomerDetailsService.ts',
      line: 48,
      column: 22,
      function: 'saveCustomerDetails',
      stack: 'TypeError: Cannot read properties of undefined\n at CustomerDetailsService.saveCustomerDetails',
      page: '/checkout',
      timestamp: '2026-09-22T12:00:00.000Z'
    };
    const parsed = RuntimeErrorSchema.parse(validError);
    expect(parsed.line).toBe(48);
    expect(parsed.function).toBe('saveCustomerDetails');
  });

  it('validates a valid NetworkEvent', () => {
    const validNetwork = {
      sessionId: 'SR-1042',
      type: 'network',
      method: 'POST',
      url: '/api/customer-details',
      status: 500,
      duration: 820,
      page: '/checkout',
      timestamp: '2026-09-22T12:00:00.000Z'
    };
    const parsed = NetworkEventSchema.parse(validNetwork);
    expect(parsed.status).toBe(500);
    expect(parsed.method).toBe('POST');
  });

  it('validates a valid DatabaseResult', () => {
    const validDb = {
      sessionId: 'SR-1042',
      type: 'database_result',
      operation: 'customer_details_insert',
      status: 'failed',
      reason: 'Database transaction rolled back: address postalCode normalization error',
      recordId: null,
      timestamp: '2026-09-22T12:00:00.000Z'
    };
    const parsed = DatabaseResultSchema.parse(validDb);
    expect(parsed.status).toBe('failed');
    expect(parsed.recordId).toBeNull();
  });

  it('validates a valid PrivacyReport enforcing 0 leaked values', () => {
    const validPrivacy = {
      sessionId: 'SR-1042',
      inputFieldsDetected: 5,
      fieldsMasked: 5,
      privateAreasBlocked: 1,
      sensitiveValuesUploaded: 0,
      tokensUploaded: 0,
      status: 'SAFE'
    };
    const parsed = PrivacyReportSchema.parse(validPrivacy);
    expect(parsed.status).toBe('SAFE');
    expect(parsed.sensitiveValuesUploaded).toBe(0);

    // Should reject if sensitive values > 0
    expect(() =>
      PrivacyReportSchema.parse({
        ...validPrivacy,
        sensitiveValuesUploaded: 1 as any
      })
    ).toThrow();
  });

  it('validates a valid PerformanceReport', () => {
    const validPerf = {
      sessionId: 'SR-1042',
      pageLoadDuration: 1800,
      sdkOverheadPercent: 3.3,
      eventCount: 24,
      payloadSizeBytes: 4200,
      longTaskCount: 0
    };
    const parsed = PerformanceReportSchema.parse(validPerf);
    expect(parsed.sdkOverheadPercent).toBe(3.3);
  });

  it('validates a valid AIResult requiring developer review', () => {
    const validAI = {
      sessionId: 'SR-1042',
      errorTitle: 'Unhandled undefined postalCode in address normalization',
      severity: 'high',
      file: 'CustomerDetailsService.ts',
      startLine: 48,
      endLine: 48,
      function: 'saveCustomerDetails',
      rootCause: 'Direct access of customer.address.postalCode without optional chaining throws TypeError when postalCode is undefined.',
      explanation: 'Use optional chaining customer.address?.postalCode?.toUpperCase() ?? "" to safely handle synthetic and optional postal codes.',
      correctedCode: 'const normalizedZip = customer.address?.postalCode?.toUpperCase() ?? "";',
      confidence: 0.94,
      requiresReview: true,
      provider: 'mock'
    };
    const parsed = AIResultSchema.parse(validAI);
    expect(parsed.confidence).toBe(0.94);
    expect(parsed.requiresReview).toBe(true);
  });

  it('validates user roles and authentication schemas', () => {
    expect(userRoleSchema.parse('admin')).toBe('admin');
    expect(userRoleSchema.parse('developer')).toBe('developer');
    expect(userRoleSchema.parse('viewer')).toBe('viewer');
    expect(() => userRoleSchema.parse('superadmin')).toThrow();

    const validLogin = {
      email: 'developer@safereplay.demo',
      password: 'Developer@123',
      rememberMe: true
    };
    expect(loginRequestSchema.parse(validLogin).email).toBe('developer@safereplay.demo');

    const validUser = {
      id: 'USR-DEV-01',
      name: 'Sam Developer',
      email: 'developer@safereplay.demo',
      role: 'developer' as const
    };
    expect(userSchema.parse(validUser).role).toBe('developer');

    const validAuthRes = {
      authenticated: true,
      user: validUser,
      token: 'SR_AUTH_test_token'
    };
    expect(authResponseSchema.parse(validAuthRes).authenticated).toBe(true);
  });
});
