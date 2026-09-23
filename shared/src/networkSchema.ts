import { z } from 'zod';

export const NetworkEventSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.literal('network').default('network'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  url: z.string().min(1, 'url is required'),
  status: z.number().int(),
  duration: z.number().nonnegative(),
  page: z.string().min(1, 'page is required'),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  headers: z.record(z.string()).optional(),
  requestSummary: z.record(z.unknown()).optional(),
  responseSummary: z.record(z.unknown()).optional()
});

export type NetworkEvent = z.infer<typeof NetworkEventSchema>;
