import { z } from 'zod';

export const AISeverityEnum = z.enum(['low', 'medium', 'high', 'critical']);

export const AIResultSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  errorTitle: z.string().min(1, 'errorTitle is required'),
  severity: AISeverityEnum,
  file: z.string().min(1, 'file is required'),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  function: z.string().min(1, 'function is required'),
  rootCause: z.string().min(1, 'rootCause is required'),
  explanation: z.string().min(1, 'explanation is required'),
  correctedCode: z.string().min(1, 'correctedCode is required'),
  confidence: z.number().min(0).max(1),
  requiresReview: z.literal(true),
  provider: z.enum(['mock', 'openai', 'gemini', 'external'])
});

export type AISeverity = z.infer<typeof AISeverityEnum>;
export type AIResult = z.infer<typeof AIResultSchema>;
