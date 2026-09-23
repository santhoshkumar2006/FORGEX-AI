import { User, LoginRequest, AuthResponse } from '@safereplay/shared';

const AUTH_TOKEN_KEY = 'safereplay_auth_token';
const AUTH_USER_KEY = 'safereplay_auth_user';

export function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(user: User, token: string, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Authentication APIs
export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
}

export async function fetchCurrentUser(): Promise<{ authenticated: boolean; user?: User; message?: string }> {
  const token = getStoredToken();
  if (!token) return { authenticated: false };

  const res = await fetch('/api/auth/me', {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
  } finally {
    clearStoredAuth();
  }
}

export async function fetchAdminUsers(): Promise<{ users?: User[]; message?: string }> {
  const res = await fetch('/api/auth/users', {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

// Dashboard Data APIs
export async function fetchSessions() {
  const res = await fetch('/api/sessions', {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

export async function fetchSessionDetails(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}`, {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

export async function fetchSourceFile(filename: string) {
  const res = await fetch(`/api/source/${filename}`, {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

export async function runAIAnalysis(sessionId: string, file?: string, line?: number) {
  const res = await fetch('/api/analyze-error', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ sessionId, file, line })
  });
  return res.json();
}

export async function runFixVerification(sessionId: string) {
  const res = await fetch('/api/verify-fix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ sessionId })
  });
  return res.json();
}

export async function deleteSession(sessionId: string) {
  const res = await fetch(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}

// Fix Deployment APIs
export async function applyFix(): Promise<{ success: boolean; isFixApplied: boolean; message: string }> {
  const res = await fetch('/api/fix/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  return res.json();
}

export async function resetFix(): Promise<{ success: boolean; isFixApplied: boolean; message: string }> {
  const res = await fetch('/api/fix/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
  });
  return res.json();
}

export async function getFixStatus(): Promise<{ success: boolean; isFixApplied: boolean }> {
  const res = await fetch('/api/fix/status', {
    headers: { ...getAuthHeaders() }
  });
  return res.json();
}
