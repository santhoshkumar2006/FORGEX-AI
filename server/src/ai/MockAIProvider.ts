import { AIProvider, AIAnalysisContext } from './AIProvider';
import { AIResult, AIResultSchema } from '@safereplay/shared';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock';

  public async analyzeError(context: AIAnalysisContext): Promise<AIResult> {
    const { sessionId, error, databaseResult } = context;

    const file = error?.file || 'CustomerDetailsService.ts';
    const errorMsg = error?.message || 'Database transaction rolled back';
    const line = error?.line || 48;
    const funcName = error?.function || 'saveCustomerDetails';

    // Tailored root-cause analysis for the controlled demo bug
    const result: AIResult = {
      sessionId,
      errorTitle: 'Unhandled undefined postalCode property in address normalization',
      severity: 'high',
      file,
      startLine: line,
      endLine: line,
      function: funcName,
      rootCause: `At line ${line}, the code attempts to call '.toUpperCase()' directly on 'customer.address.postalCode'. When the synthetic checkout payload contains an address without a nested postalCode or when address is a plain string, 'customer.address.postalCode' is undefined, throwing a TypeError and triggering a database transaction rollback.`,
      explanation: `To prevent runtime crashes and ensure atomic database transactions, use optional chaining '?.' along with the nullish coalescing operator '??' to provide a safe fallback ('N/A' or empty string). This guarantees that undefined postal codes are handled gracefully without terminating the customer details insert operation.`,
      correctedCode: `      // FIXED: Safe optional chaining and nullish coalescing fallback
      const normalizedZip = customer.address?.postalCode?.toUpperCase() ?? 'N/A';`,
      confidence: 0.96,
      requiresReview: true,
      provider: 'mock'
    };

    return AIResultSchema.parse(result);
  }
}
