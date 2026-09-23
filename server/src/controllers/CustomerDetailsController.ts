import { Request, Response } from 'express';
import { CustomerDetailsService } from '../services/CustomerDetailsService';

export class CustomerDetailsController {
  public static async save(req: Request, res: Response) {
    try {
      const { name, email, phone, address, sessionId } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          saved: false,
          message: 'Details were not stored.',
          reason: 'Missing required customer name or email'
        });
      }

      const sid = sessionId || (req.headers['x-session-id'] as string) || 'SR-1042';

      const result = await CustomerDetailsService.saveCustomerDetails(
        { name, email, phone, address, sessionId: sid },
        sid
      );

      if (!result.saved) {
        return res.status(500).json({
          saved: false,
          message: result.message,
          reason: result.reason,
          operation: 'customer_details_insert'
        });
      }

      return res.status(200).json({
        saved: true,
        message: result.message,
        recordId: result.recordId,
        operation: 'customer_details_insert'
      });
    } catch (err: any) {
      return res.status(500).json({
        saved: false,
        message: 'Details were not stored.',
        reason: 'Internal Server Error'
      });
    }
  }
}
