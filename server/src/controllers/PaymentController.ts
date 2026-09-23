import { Request, Response } from 'express';
import { CheckoutService } from '../services/CheckoutService';

export class PaymentController {
  public static async process(req: Request, res: Response) {
    try {
      const { amount, items, sessionId, syntheticCardLast4 } = req.body;
      const sid = sessionId || (req.headers['x-session-id'] as string) || 'SR-1042';

      if (items && Array.isArray(items)) {
        const calc = CheckoutService.calculateTotals(items);
        const result = await CheckoutService.processPayment({
          amount: calc.total,
          sessionId: sid,
          syntheticCardLast4
        });
        return res.status(200).json(result);
      }

      const result = await CheckoutService.processPayment({
        amount: Number(amount) || 0,
        sessionId: sid,
        syntheticCardLast4
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Payment processing error'
      });
    }
  }

  public static calculate(req: Request, res: Response) {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ success: false, message: 'Invalid items array' });
      }

      const calculation = CheckoutService.calculateTotals(items);
      return res.status(200).json({
        success: true,
        calculation
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
