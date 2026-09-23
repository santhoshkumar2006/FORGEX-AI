import { z } from 'zod';

export const RuntimeErrorSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.literal('runtime_error').default('runtime_error'),
  message: z.string().min(1, 'message is required'),
  file: z.string().min(1, 'file is required'),
  line: z.number().int().nonnegative(),
  column: z.number().int().nonnegative().optional().default(0),
  function: z.string().default('anonymous'),
  stack: z.string().default(''),
  page: z.string().min(1, 'page is required'),
  timestamp: z.string().datetime({ offset: true }).or(z.string())
});

export type RuntimeError = z.infer<typeof RuntimeErrorSchema>;
