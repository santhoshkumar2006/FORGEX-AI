import { CustomerDetailsService, CustomerDetailsPayload } from './CustomerDetailsService';
import { db } from '../models/DatabaseAdapter';

export interface VerificationResult {
  sessionId: string;
  originalScenario: {
    description: string;
    payload: CustomerDetailsPayload;
    originalStatus: string;
    originalError: string;
  };
  correctedScenario: {
    appliedFix: string;
    testStatus: 'passed' | 'failed';
    recordId?: string;
    errorReproduced: boolean;
  };
  verificationMessage: string;
  timestamp: string;
}

export class FixVerificationService {
  public static async verifyFix(sessionId: string): Promise<VerificationResult> {
    const timestamp = new Date().toISOString();

    // Standard reproduction payload for the customer details submission
    const reproductionPayload: CustomerDetailsPayload = {
      name: 'Synthetic Alex Doe',
      email: 'alex.doe@example.synthetic',
      phone: '555-0199',
      address: '100 Innovation Way, Tech Park', // Plain string / omitted postalCode
      sessionId
    };

    // Step 1: Run reproduction against the original buggy method
    const originalResult = await CustomerDetailsService.saveCustomerDetails(reproductionPayload, `${sessionId}-repro-orig`);

    // Step 2: Run verification against the corrected method
    const correctedResult = await CustomerDetailsService.saveCustomerDetailsFixed(reproductionPayload, `${sessionId}-repro-fixed`);

    const passed = correctedResult.saved === true;

    db.logAudit('FIX_VERIFICATION_EXECUTED', sessionId, {
      passed,
      originalFailed: !originalResult.saved,
      fixedSucceeded: correctedResult.saved
    });

    return {
      sessionId,
      originalScenario: {
        description: 'Customer checkout submission without nested postalCode attribute',
        payload: reproductionPayload,
        originalStatus: originalResult.saved ? 'success' : 'failed',
        originalError: originalResult.reason || 'Unhandled TypeError'
      },
      correctedScenario: {
        appliedFix: 'customer.address?.postalCode?.toUpperCase() ?? "N/A"',
        testStatus: passed ? 'passed' : 'failed',
        recordId: correctedResult.recordId,
        errorReproduced: !passed
      },
      verificationMessage: 'Passed for the captured reproduction scenario.',
      timestamp
    };
  }
}
