import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { CustomerDetailsService } from '../src/services/CustomerDetailsService';

describe('SafeReplay Backend API Test Suite', () => {
  beforeEach(() => {
    CustomerDetailsService.setFixApplied(false);
  });

  it('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/products returns synthetic products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toBeDefined();
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('POST /api/customer-details triggers controlled database error and rollback', async () => {
    const res = await request(app)
      .post('/api/customer-details')
      .send({
        name: 'Synthetic Jane Doe',
        email: 'jane.doe@example.synthetic',
        phone: '555-0188',
        address: '456 Innovation Blvd', // Triggers line 48 controlled error
        sessionId: 'SR-TEST-1042'
      });

    expect(res.status).toBe(500);
    expect(res.body.saved).toBe(false);
    expect(res.body.message).toBe('Details were not stored.');
    expect(res.body.reason).toContain('Database transaction rolled back');
  });

  it('POST /api/customer-details validation fails for empty name/email', async () => {
    const res = await request(app)
      .post('/api/customer-details')
      .send({
        phone: '555-0188',
        sessionId: 'SR-TEST-1042'
      });

    expect(res.status).toBe(400);
    expect(res.body.saved).toBe(false);
  });

  it('POST /api/sessions/events stores session events safely', async () => {
    const res = await request(app)
      .post('/api/sessions/events')
      .send({
        sessionId: 'SR-TEST-1042',
        events: [
          {
            sessionId: 'SR-TEST-1042',
            type: 'click',
            page: '/checkout',
            timestamp: new Date().toISOString(),
            data: { selector: 'button#pay-now' }
          }
        ],
        privacyReport: {
          sessionId: 'SR-TEST-1042',
          inputFieldsDetected: 4,
          fieldsMasked: 4,
          privateAreasBlocked: 0,
          sensitiveValuesUploaded: 0,
          tokensUploaded: 0,
          status: 'SAFE'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/sessions and GET /api/sessions/:sessionId returns session details', async () => {
    const listRes = await request(app).get('/api/sessions');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.sessions)).toBe(true);

    const detailRes = await request(app).get('/api/sessions/SR-TEST-1042');
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.session.sessionId).toBe('SR-TEST-1042');
    expect(detailRes.body.timeline).toBeDefined();
  });

  it('POST /api/analyze-error executes AI root cause analysis and schema validation', async () => {
    const res = await request(app)
      .post('/api/analyze-error')
      .send({
        sessionId: 'SR-TEST-1042',
        file: 'CustomerDetailsService.ts',
        line: 48
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.confidence).toBeGreaterThan(0.8);
    expect(res.body.analysis.requiresReview).toBe(true);
    expect(res.body.analysis.correctedCode).toBeDefined();
  });

  it('GET /api/source/:file respects source file allowlist and rejects unauthorized files', async () => {
    const allowedRes = await request(app).get('/api/source/CustomerDetailsService.ts');
    expect(allowedRes.status).toBe(200);
    expect(allowedRes.body.filename).toBe('CustomerDetailsService.ts');

    const forbiddenRes = await request(app).get('/api/source/passwords.env');
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

  it('POST /api/verify-fix runs prototype verification flow', async () => {
    const res = await request(app)
      .post('/api/verify-fix')
      .send({
        sessionId: 'SR-TEST-1042'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.verification.verificationMessage).toBe('Passed for the captured reproduction scenario.');
    expect(res.body.verification.correctedScenario.testStatus).toBe('passed');
  });

  // Exactly 2 Role-Based Login Accounts Tests
  describe('Two-User Role-Based Access Control', () => {
    it('authenticates developer as admin account with full access', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'developer@safereplay.demo',
          password: 'Developer@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(true);
      expect(res.body.user.role).toBe('admin');
      expect(res.body.token).toBeDefined();
    });

    it('authenticates viewer account with read-only access', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@safereplay.demo',
          password: 'User@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(true);
      expect(res.body.user.role).toBe('viewer');
    });

    it('rejects invalid password without leaking credential details', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'developer@safereplay.demo',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.authenticated).toBe(false);
      expect(res.body.message).toBe('Unable to sign in. Please check your credentials.');
    });

    it('validates session token via GET /api/auth/me and handles logout', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'developer@safereplay.demo',
          password: 'Developer@123'
        });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.role).toBe('admin');

      // Developer (Admin) can list users
      const usersRes = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);

      expect(usersRes.status).toBe(200);
      expect(usersRes.body.users.length).toBeGreaterThanOrEqual(2);

      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutRes.status).toBe(200);

      // Post-logout validation fails
      const postLogoutRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(postLogoutRes.status).toBe(401);
    });
  });
});
