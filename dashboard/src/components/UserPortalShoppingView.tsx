import React, { useState } from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { User } from '@safereplay/shared';

interface UserPortalShoppingViewProps {
  currentUser: User;
  onLogout: () => void;
}

export const UserPortalShoppingView: React.FC<UserPortalShoppingViewProps> = ({
  currentUser,
  onLogout
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Top User Portal Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Portal Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">SafeReplay</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  User Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Privacy-Safe Shopping Store</p>
            </div>
          </div>

          {/* Privacy Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Zero-PII Privacy Protection Active</span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Refresh Store Button */}
            <button
              onClick={handleRefresh}
              id="refresh-store-btn"
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Reload Shopping Store"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* User Profile Info */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate max-w-[120px] mt-0.5">
                  {currentUser.email}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 uppercase">
                Customer
              </span>
            </div>

            {/* Open Fullscreen Store Link */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Full Store</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              id="user-logout-btn"
              title="Sign out of User Portal"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-700 bg-white hover:bg-red-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors shadow-2xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Embedded Live Shopping Application View */}
      <main className="flex-1 flex flex-col bg-slate-100">
        <div className="w-full flex-1 min-h-[calc(100vh-64px)] relative">
          <iframe
            key={iframeKey}
            src="http://localhost:3000"
            title="SafeReplay Demo Shopping Store"
            className="w-full h-full min-h-[calc(100vh-64px)] border-0"
            style={{ display: 'block' }}
          />
        </div>
      </main>
    </div>
  );
};
