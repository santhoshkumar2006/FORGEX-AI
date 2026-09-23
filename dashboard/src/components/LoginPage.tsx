import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { User } from '@safereplay/shared';
import { loginUser, setStoredAuth } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Enter your work email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Enter your password.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotNotice(null);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
        rememberMe
      });

      if (response.authenticated && response.user && response.token) {
        setStoredAuth(response.user, response.token, rememberMe);
        onLoginSuccess(response.user);
      } else {
        setAuthError(response.message || 'Unable to sign in. Please check your credentials.');
      }
    } catch (err: any) {
      setAuthError('Sign-in is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SafeReplay</h1>
            <p className="text-xs text-slate-500 mt-0.5">Role-Based Workspace Login</p>
          </div>
        </div>

        {/* Authentication Error */}
        {authError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Password Recovery Notice */}
        {forgotNotice && (
          <div
            role="status"
            className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800"
          >
            {forgotNotice}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Work Email */}
          <div>
            <label htmlFor="work-email" className="block text-xs font-bold text-slate-700 mb-1">
              Work email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                id="work-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                placeholder="name@company.com"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'email-error' : undefined}
                className={`w-full bg-slate-50/50 border ${
                  emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors`}
              />
            </div>
            {emailError && (
              <p id="email-error" className="text-[11px] text-red-600 font-medium mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="account-password" className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotNotice('Password recovery is not enabled in the prototype.')}
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LockKeyhole className="w-4 h-4 stroke-[1.8]" />
              </div>
              <input
                id="account-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                placeholder="Enter your password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'password-error' : undefined}
                className={`w-full bg-slate-50/50 border ${
                  passwordError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'
                } rounded-xl pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[1.8]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[1.8]" />
                )}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="text-[11px] text-red-600 font-medium mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-600 cursor-pointer select-none">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="sign-in-btn"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-[11px] text-slate-400 mt-4">
        SafeReplay Developer Studio • Zero-PII Session Security
      </p>
    </div>
  );
};
