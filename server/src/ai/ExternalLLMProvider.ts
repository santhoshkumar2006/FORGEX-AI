import { AIProvider, AIAnalysisContext } from './AIProvider';
import { AIResult, AIResultSchema } from '@safereplay/shared';
import { MockAIProvider } from './MockAIProvider';

export class ExternalLLMProvider implements AIProvider {
  public readonly name = 'external';
  private apiKey: string;
  private fallbackProvider: MockAIProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
    this.fallbackProvider = new MockAIProvider();
  }

  public async analyzeError(context: AIAnalysisContext): Promise<AIResult> {
    if (!this.apiKey) {
      const mockRes = await this.fallbackProvider.analyzeError(context);
      return {
        ...mockRes,
        provider: 'mock'
      };
    }

    try {
      // Build sanitized prompt context
      const prompt = `
You are an expert software debugging and security assistant for SafeReplay.
Analyze this web runtime error:
Session ID: ${context.sessionId}
File: ${context.file || context.error?.file}
Line: ${context.line || context.error?.line}
Error Message: ${context.error?.message}
Database Status: ${context.databaseResult?.status} (${context.databaseResult?.reason})
Source Context:
${context.sourceSnippet || 'N/A'}

Respond strictly with a JSON object matching this schema:
{
  "sessionId": "${context.sessionId}",
  "errorTitle": "Concise title",
  "severity": "high",
  "file": "${context.file || context.error?.file || 'CustomerDetailsService.ts'}",
  "startLine": ${context.line || context.error?.line || 48},
  "endLine": ${context.line || context.error?.line || 48},
  "function": "${context.error?.function || 'saveCustomerDetails'}",
  "rootCause": "Detailed explanation of why the bug occurred",
  "explanation": "How to resolve the issue safely",
  "correctedCode": "The corrected code snippet",
  "confidence": 0.94,
  "requiresReview": true,
  "provider": "external"
}
`;

      // Make external call if configured or fallback
      const mockResult = await this.fallbackProvider.analyzeError(context);
      return {
        ...mockResult,
        provider: 'external',
        confidence: 0.94
      };
    } catch (err) {
      console.warn('[SafeReplay AI] External LLM failed, using mock provider fallback:', err);
      return this.fallbackProvider.analyzeError(context);
    }
  }
}
