import { z } from 'zod';

export const PerformanceReportSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  pageLoadDuration: z.number().nonnegative(),
  sdkOverheadPercent: z.number().nonnegative(),
  eventCount: z.number().int().nonnegative(),
  payloadSizeBytes: z.number().int().nonnegative(),
  longTaskCount: z.number().int().nonnegative().default(0)
});

export type PerformanceReport = z.infer<typeof PerformanceReportSchema>;
