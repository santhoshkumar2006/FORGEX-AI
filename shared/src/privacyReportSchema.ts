import { z } from 'zod';

export const PrivacyReportSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  inputFieldsDetected: z.number().int().nonnegative(),
  fieldsMasked: z.number().int().nonnegative(),
  privateAreasBlocked: z.number().int().nonnegative(),
  sensitiveValuesUploaded: z.literal(0),
  tokensUploaded: z.literal(0),
  status: z.literal('SAFE')
});

export type PrivacyReport = z.infer<typeof PrivacyReportSchema>;
