import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';

export class SessionController {
  public static async ingest(req: Request, res: Response) {
    try {
      const { sessionId, events, privacyReport, performanceReport } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required'
        });
      }

      const result = SessionService.ingestEvents({
        sessionId,
        events: events || [],
        privacyReport,
        performanceReport
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to ingest events',
        error: err.message
      });
    }
  }

  public static getAll(req: Request, res: Response) {
    const sessions = SessionService.getSessions();
    return res.status(200).json({
      success: true,
      sessions
    });
  }

  public static getDetails(req: Request, res: Response) {
    const { sessionId } = req.params;
    const details = SessionService.getSessionDetails(sessionId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: `Session '${sessionId}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      ...details
    });
  }

  public static getEventsOnly(req: Request, res: Response) {
    const { sessionId } = req.params;
    const details = SessionService.getSessionDetails(sessionId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: `Session '${sessionId}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      sessionId,
      events: details.events
    });
  }

  public static delete(req: Request, res: Response) {
    const { sessionId } = req.params;
    const deleted = SessionService.deleteSession(sessionId);

    return res.status(200).json({
      success: true,
      deleted,
      message: deleted ? `Session '${sessionId}' deleted` : `Session '${sessionId}' did not exist`
    });
  }
}
