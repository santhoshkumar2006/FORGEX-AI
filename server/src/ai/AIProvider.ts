import { AIResult, RuntimeError, DatabaseResult, NetworkEvent, SessionEvent } from '@safereplay/shared';

export interface AIAnalysisContext {
  sessionId: string;
  error?: RuntimeError;
  databaseResult?: DatabaseResult;
  networkEvents?: NetworkEvent[];
  priorEvents?: SessionEvent[];
  sourceSnippet?: string;
  file?: string;
  line?: number;
}

export interface AIProvider {
  name: string;
  analyzeError(context: AIAnalysisContext): Promise<AIResult>;
}
