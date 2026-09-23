import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'developer', 'viewer']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema
});
export type User = z.infer<typeof userSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional()
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const authResponseSchema = z.object({
  authenticated: z.boolean(),
  user: userSchema.optional(),
  token: z.string().optional(),
  message: z.string().optional()
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
