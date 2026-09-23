import { z } from 'zod';

export const SessionEventTypeEnum = z.enum([
  'session_start',
  'session_end',
  'click',
  'input',
  'route_change',
  'dom_mutation',
  'form_submit',
  'navigation',
  'custom'
]);

export const EventSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  type: z.string().min(1, 'type is required'),
  timestamp: z.string().datetime({ offset: true }).or(z.string()),
  page: z.string().min(1, 'page is required'),
  data: z.record(z.unknown()).default({})
});

export type SessionEventType = z.infer<typeof SessionEventTypeEnum>;
export type SessionEvent = z.infer<typeof EventSchema>;
