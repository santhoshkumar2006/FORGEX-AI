import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';
import { ProductController } from '../controllers/ProductController';
import { CustomerDetailsController } from '../controllers/CustomerDetailsController';
import { PaymentController } from '../controllers/PaymentController';
import { SessionController } from '../controllers/SessionController';
import { AnalysisController } from '../controllers/AnalysisController';
import { SourceController } from '../controllers/SourceController';
import { VerificationController } from '../controllers/VerificationController';
import { AuthController } from '../controllers/AuthController';

export const router = Router();

// Authentication & Role Management
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);
router.get('/auth/me', AuthController.me);
router.get('/auth/users', AuthController.listUsers);

// Health
router.get('/health', HealthController.check);

// Products
router.get('/products', ProductController.getAll);
router.get('/products/:id', ProductController.getById);

// Customer Details & Checkout
router.post('/customer-details', CustomerDetailsController.save);
router.post('/payment', PaymentController.process);
router.post('/payment/calculate', PaymentController.calculate);

// Session Replay & Ingestion
router.post('/sessions/events', SessionController.ingest);
router.get('/sessions', SessionController.getAll);
router.get('/sessions/:sessionId', SessionController.getDetails);
router.get('/sessions/:sessionId/events', SessionController.getEventsOnly);
router.delete('/sessions/:sessionId', SessionController.delete);

// AI Root Cause Analysis
router.post('/analyze-error', AnalysisController.analyze);

// Fix Verification & Live Fix Deployment
router.post('/verify-fix', VerificationController.verify);
router.post('/verification/verify', VerificationController.verify);
router.post('/fix/apply', VerificationController.applyFix);
router.post('/verification/apply-fix', VerificationController.applyFix);
router.post('/fix/reset', VerificationController.resetFix);
router.post('/verification/reset-fix', VerificationController.resetFix);
router.get('/fix/status', VerificationController.getStatus);
router.get('/verification/status', VerificationController.getStatus);

// Source Code Inspection (Allowlist Guarded)
router.get('/source/:file', SourceController.getFile);
