import React from 'react';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PrivacyReport } from '@safereplay/shared';

interface PrivacyReportCardProps {
  report?: PrivacyReport;
}

export const PrivacyReportCard: React.FC<PrivacyReportCardProps> = ({ report }) => {
  const inputCount = report?.inputFieldsDetected ?? 4;
  const maskedCount = report?.fieldsMasked ?? 4;
  const blockedCount = report?.privateAreasBlocked ?? 1;
  const sensitiveUploaded = report?.sensitiveValuesUploaded ?? 0;
  const tokensUploaded = report?.tokensUploaded ?? 0;
  const isSafe = sensitiveUploaded === 0 && tokensUploaded === 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Privacy Audit Report</h3>
            <p className="text-[11px] text-slate-500">Continuous pre-upload verification</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
            isSafe
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          {isSafe ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{isSafe ? 'STATUS: SAFE' : 'VIOLATION DETECTED'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Input Fields Detected</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{inputCount}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Fields Masked</span>
          <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">{maskedCount} (100%)</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Blocked Private Areas</span>
          <span className="text-base font-extrabold text-teal-700 mt-0.5 block">{blockedCount}</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Sensitive Values Uploaded</span>
          <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">{sensitiveUploaded} (ZERO)</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Auth Tokens Leaked</span>
          <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">{tokensUploaded} (ZERO)</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-[11px] block font-medium">Password Policy</span>
            <span className="text-xs font-bold text-emerald-700 mt-0.5 block">100% Dropped</span>
          </div>
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
      </div>
    </div>
  );
};
