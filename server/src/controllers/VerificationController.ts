import { Request, Response } from 'express';
import { FixVerificationService } from '../services/FixVerificationService';
import { CustomerDetailsService } from '../services/CustomerDetailsService';

export class VerificationController {
  public static async verify(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId is required for fix verification'
        });
      }

      const result = await FixVerificationService.verifyFix(sessionId);

      return res.status(200).json({
        success: true,
        verification: result
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Fix verification execution failed',
        error: err.message
      });
    }
  }

  public static async applyFix(req: Request, res: Response) {
    CustomerDetailsService.setFixApplied(true);
    return res.status(200).json({
      success: true,
      isFixApplied: true,
      message: 'Fix successfully applied to live service. User checkout errors are now resolved.'
    });
  }

  public static async resetFix(req: Request, res: Response) {
    CustomerDetailsService.setFixApplied(false);
    return res.status(200).json({
      success: true,
      isFixApplied: false,
      message: 'Reset to controlled demo error state.'
    });
  }

  public static async getStatus(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      isFixApplied: CustomerDetailsService.getFixStatus()
    });
  }
}
