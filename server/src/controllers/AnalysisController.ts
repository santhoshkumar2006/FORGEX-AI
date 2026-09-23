import { Request, Response } from 'express';
import { getAIProvider } from '../ai';
import { SessionService } from '../services/SessionService';
import { SourceService } from '../services/SourceService';
import { db } from '../models/DatabaseAdapter';
import { AIResultSchema } from '@safereplay/shared';

export class AnalysisController {
  public static async analyze(req: Request, res: Response) {
    try {
      const { sessionId, error, databaseResult, file, line } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required for AI analysis'
        });
      }

      // Fetch session details if available
      const sessionDetails = SessionService.getSessionDetails(sessionId);
      const targetError = error || sessionDetails?.errors?.[0];
      const targetDbResult = databaseResult || sessionDetails?.dbResults?.[0];

      const targetFile = file || targetError?.file || 'CustomerDetailsService.ts';
      const targetLine = line || targetError?.line || 48;

      // Extract source snippet if file is allowed
      let sourceSnippet = '';
      if (SourceService.isFileAllowed(targetFile)) {
        try {
          const src = SourceService.getSourceFile(targetFile);
          const start = Math.max(0, targetLine - 10);
          const end = Math.min(src.lines.length, targetLine + 10);
          sourceSnippet = src.lines.slice(start, end).join('\n');
        } catch {
          // Ignore
        }
      }

      const aiProvider = getAIProvider();
      const analysisResult = await aiProvider.analyzeError({
        sessionId,
        error: targetError,
        databaseResult: targetDbResult,
        networkEvents: sessionDetails?.networkEvents,
        priorEvents: sessionDetails?.events,
        sourceSnippet,
        file: targetFile,
        line: targetLine
      });

      // Validate against schema
      const validated = AIResultSchema.parse(analysisResult);

      // Save to database
      db.saveAIAnalysis(sessionId, validated);

      return res.status(200).json({
        success: true,
        analysis: validated
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'AI error analysis failed',
        error: err.message
      });
    }
  }
}
