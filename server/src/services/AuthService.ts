import crypto from 'crypto';
import { User, UserRole, LoginRequest, AuthResponse } from '@safereplay/shared';

interface InternalUserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
}

export class AuthService {
  private static users: Map<string, InternalUserRecord> = new Map();
  private static activeSessions: Map<string, { userId: string; expiresAt: number }> = new Map();
  private static initialized = false;

  private static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  public static init() {
    if (this.initialized) return;

    // Two role-based accounts only
    const seedAccounts = [
      {
        id: 'USR-USER-01',
        name: 'User',
        email: 'user@safereplay.demo',
        password: 'User@123',
        role: 'viewer' as UserRole
      },
      {
        id: 'USR-DEV-ADMIN-01',
        name: 'Developer',
        email: 'developer@safereplay.demo',
        password: 'Developer@123',
        role: 'admin' as UserRole
      }
    ];

    for (const acc of seedAccounts) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = this.hashPassword(acc.password, salt);
      this.users.set(acc.email.toLowerCase(), {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        passwordHash,
        salt
      });
    }

    this.initialized = true;
  }

  public static login(request: LoginRequest): AuthResponse {
    this.init();

    if (!request.email || !request.password) {
      return {
        authenticated: false,
        message: 'Unable to sign in. Please check your credentials.'
      };
    }

    const email = request.email.toLowerCase().trim();
    const userRecord = this.users.get(email);

    if (!userRecord) {
      return {
        authenticated: false,
        message: 'Unable to sign in. Please check your credentials.'
      };
    }

    const calculatedHash = this.hashPassword(request.password, userRecord.salt);
    if (!crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(userRecord.passwordHash))) {
      return {
        authenticated: false,
        message: 'Unable to sign in. Please check your credentials.'
      };
    }

    // Generate secure session token
    const token = `SR_AUTH_${crypto.randomBytes(24).toString('hex')}`;
    const ttlMs = request.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    this.activeSessions.set(token, {
      userId: userRecord.id,
      expiresAt: Date.now() + ttlMs
    });

    const user: User = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: userRecord.role
    };

    return {
      authenticated: true,
      user,
      token,
      message: 'Authentication successful.'
    };
  }

  public static validateToken(token?: string): User | null {
    this.init();
    if (!token) return null;

    const session = this.activeSessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return null;
    }

    for (const u of this.users.values()) {
      if (u.id === session.userId) {
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role
        };
      }
    }

    return null;
  }

  public static logout(token?: string): boolean {
    if (!token) return true;
    return this.activeSessions.delete(token);
  }

  public static getUsers(): User[] {
    this.init();
    return Array.from(this.users.values()).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role
    }));
  }
}
