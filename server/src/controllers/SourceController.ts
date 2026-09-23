import { Request, Response } from 'express';
import { SourceService } from '../services/SourceService';

export class SourceController {
  public static getFile(req: Request, res: Response) {
    try {
      const { file } = req.params;

      if (!SourceService.isFileAllowed(file)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: File '${file}' is not in the source allowlist`
        });
      }

      const fileData = SourceService.getSourceFile(file);
      return res.status(200).json({
        success: true,
        ...fileData
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve source file',
        error: err.message
      });
    }
  }
}
