import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

interface PrivacyBannerProps {
  sessionId: string;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ sessionId }) => {
  return (
    <div className="bg-emerald-50/80 border-b border-emerald-200/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SafeReplay SDK Active</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-mono border border-emerald-300 font-bold">
            {sessionId}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-600 text-[11px]">
          <span className="flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-emerald-600" /> Pre-Upload PII Masking
          </span>
          <span className="flex items-center gap-1 font-medium">
            <EyeOff className="w-3 h-3 text-emerald-600" /> Passwords & Tokens Blocked
          </span>
          <span className="text-slate-400 hidden sm:inline">| Synthetic Demo Only</span>
        </div>
      </div>
    </div>
  );
};
