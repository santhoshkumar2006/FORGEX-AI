import {
  SessionEvent,
  RuntimeError,
  NetworkEvent,
  DatabaseResult,
  PrivacyReport,
  PerformanceReport
} from '@safereplay/shared';

export interface ReplayConfig {
  sessionId: string;
  uploadUrl: string;
  maskInputs?: boolean;
  enabled?: boolean;
  debug?: boolean;
  batchIntervalMs?: number;
  maxBatchSize?: number;
  maxPayloadSizeBytes?: number;
  sampleRate?: number;
}

export type AnyReplayEvent =
  | SessionEvent
  | RuntimeError
  | NetworkEvent
  | DatabaseResult;

export interface SanitizedDOMNode {
  tagName: string;
  id?: string;
  className?: string;
  attributes?: Record<string, string>;
  textContent?: string;
  children?: SanitizedDOMNode[];
}
