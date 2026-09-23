import { z } from 'zod';

export const DatabaseResultSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.literal('database_result').default('database_result'),
  operation: z.string().min(1, 'operation is required'),
  status: z.enum(['success', 'failed']),
  reason: z.string().nullable().optional().default(null),
  recordId: z.string().nullable().optional().default(null),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  metadata: z.record(z.unknown()).optional()
});

export type DatabaseResult = z.infer<typeof DatabaseResultSchema>;
