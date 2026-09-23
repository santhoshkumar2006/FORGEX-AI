import { Request, Response } from 'express';

export class HealthController {
  public static check(req: Request, res: Response) {
    return res.status(200).json({
      status: 'ok',
      service: 'SafeReplay Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}
