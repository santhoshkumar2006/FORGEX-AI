import { db } from '../models/DatabaseAdapter';
import {
  SessionEvent,
  RuntimeError,
  NetworkEvent,
  DatabaseResult,
  PrivacyReport,
  PerformanceReport
} from '@safereplay/shared';

export interface IngestSessionPayload {
  sessionId: string;
  events: Array<SessionEvent | RuntimeError | NetworkEvent | DatabaseResult>;
  privacyReport?: PrivacyReport;
  performanceReport?: PerformanceReport;
}

export class SessionService {
  public static ingestEvents(payload: IngestSessionPayload) {
    const { sessionId, events, privacyReport, performanceReport } = payload;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    // Separate events by type
    const regularEvents: SessionEvent[] = [];
    let lastPage = '/';

    for (const evt of events || []) {
      if (!evt) continue;

      if (evt.page) {
        lastPage = evt.page;
      }

      if (evt.type === 'runtime_error') {
        db.addError(sessionId, evt as RuntimeError);
      } else if (evt.type === 'network') {
        db.addNetworkEvent(sessionId, evt as NetworkEvent);
      } else if (evt.type === 'database_result') {
        db.addDbResult(sessionId, evt as DatabaseResult);
      } else {
        regularEvents.push(evt as SessionEvent);
      }
    }

    if (regularEvents.length > 0) {
      db.addEvents(sessionId, regularEvents);
    }

    // Update session record
    db.upsertSession({
      sessionId,
      page: lastPage,
      privacyReport,
      performanceReport
    });

    db.logAudit('EVENTS_INGESTED', sessionId, {
      totalEvents: events?.length || 0,
      privacyReportPresent: !!privacyReport
    });

    return {
      success: true,
      sessionId,
      receivedCount: events?.length || 0
    };
  }

  public static getSessions() {
    return db.getSessions();
  }

  public static getSessionDetails(sessionId: string) {
    const session = db.getSession(sessionId);
    if (!session) return null;

    const events = db.getEvents(sessionId);
    const errors = db.getErrors(sessionId);
    const networkEvents = db.getNetworkEvents(sessionId);
    const dbResults = db.getDbResults(sessionId);
    const aiAnalysis = db.getAIAnalysis(sessionId);

    // Merge into combined timeline sorted by timestamp
    const allTimelineEvents: Array<{
      type: string;
      timestamp: string;
      page: string;
      category: 'action' | 'error' | 'network' | 'database';
      data: any;
    }> = [
      ...events.map(e => ({
        type: e.type,
        timestamp: e.timestamp,
        page: e.page,
        category: 'action' as const,
        data: e.data
      })),
      ...errors.map(e => ({
        type: 'runtime_error',
        timestamp: e.timestamp,
        page: e.page,
        category: 'error' as const,
        data: e
      })),
      ...networkEvents.map(e => ({
        type: 'network',
        timestamp: e.timestamp,
        page: e.page,
        category: 'network' as const,
        data: e
      })),
      ...dbResults.map(e => ({
        type: 'database_result',
        timestamp: e.timestamp,
        page: session.page,
        category: 'database' as const,
        data: e
      }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      session,
      timeline: allTimelineEvents,
      events,
      errors,
      networkEvents,
      dbResults,
      aiAnalysis
    };
  }

  public static deleteSession(sessionId: string) {
    return db.deleteSession(sessionId);
  }
}
