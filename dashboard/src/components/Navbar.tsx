import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  LogOut,
  Users,
  Shield,
  User as UserIcon
} from 'lucide-react';
import { User } from '@safereplay/shared';

interface NavbarProps {
  currentSessionId: string;
  currentUser: User | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSelectView: (view: 'overview' | 'replay' | 'users') => void;
  activeView: 'overview' | 'replay' | 'users';
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSessionId,
  currentUser,
  onRefresh,
  isRefreshing,
  onSelectView,
  activeView,
  onLogout
}) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            Admin
          </span>
        );
      case 'developer':
      default:
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Developer
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">SafeReplay</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                  currentUser?.role === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {currentUser?.role === 'admin' ? 'Admin Portal' : 'User Portal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Privacy-First AI Debugging</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectView('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Session Overview
            </button>
            <button
              onClick={() => onSelectView('replay')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'replay'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline & AI Analysis
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSelectView('users')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'users'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users & Roles</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Active Session Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-slate-700 font-mono text-[11px] font-bold">{currentSessionId || 'SR-1042'}</span>
          </div>

          <button
            onClick={onRefresh}
            id="refresh-sessions-btn"
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* User Profile Card */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
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
              {getRoleBadge(currentUser.role)}
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            id="logout-btn"
            title="Sign out of SafeReplay"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-700 bg-white hover:bg-red-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>

          {/* Demo Store Link */}
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl shadow-xs hover:shadow transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Store</span>
            <ExternalLink className="w-3 h-3 text-blue-100" />
          </a>
        </div>
      </div>
    </header>
  );
};
