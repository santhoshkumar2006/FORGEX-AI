import { AIProvider } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';
import { ExternalLLMProvider } from './ExternalLLMProvider';

export * from './AIProvider';
export * from './MockAIProvider';
export * from './ExternalLLMProvider';

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || 'mock';
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

  if (providerType === 'external' || (providerType === 'gemini' || providerType === 'openai') && apiKey) {
    return new ExternalLLMProvider(apiKey);
  }

  return new MockAIProvider();
}
