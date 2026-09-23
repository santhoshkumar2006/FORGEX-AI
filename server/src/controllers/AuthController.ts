import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(401).json({
          authenticated: false,
          message: 'Unable to sign in. Please check your credentials.'
        });
      }

      const result = AuthService.login({ email, password, rememberMe });

      if (!result.authenticated) {
        return res.status(401).json({
          authenticated: false,
          message: 'Unable to sign in. Please check your credentials.'
        });
      }

      return res.status(200).json({
        authenticated: true,
        user: result.user,
        token: result.token
      });
    } catch (err: any) {
      return res.status(500).json({
        authenticated: false,
        message: 'Sign-in is temporarily unavailable. Please try again.'
      });
    }
  }

  public static async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : (req.headers['x-auth-token'] as string);

      const user = AuthService.validateToken(token);
      if (!user) {
        return res.status(401).json({
          authenticated: false,
          message: 'Your session has expired. Please sign in again.'
        });
      }

      return res.status(200).json({
        authenticated: true,
        user
      });
    } catch (err: any) {
      return res.status(500).json({
        authenticated: false,
        message: 'Internal Server Error'
      });
    }
  }

  public static async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : (req.headers['x-auth-token'] as string);

      AuthService.logout(token);
      return res.status(200).json({
        authenticated: false,
        message: 'Logged out successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({
        authenticated: false,
        message: 'Internal Server Error'
      });
    }
  }

  public static async listUsers(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : (req.headers['x-auth-token'] as string);

      const user = AuthService.validateToken(token);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          message: 'Access denied. You do not have permission to view this page.'
        });
      }

      const users = AuthService.getUsers();
      return res.status(200).json({ users });
    } catch (err: any) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
