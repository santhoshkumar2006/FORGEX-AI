import React from 'react';
import { Database, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { DatabaseResult } from '@safereplay/shared';

interface DatabaseResultCardProps {
  results: DatabaseResult[];
}

export const DatabaseResultCard: React.FC<DatabaseResultCardProps> = ({ results }) => {
  const latest = results[results.length - 1];
  const isSuccess = latest?.status === 'success';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}
          >
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Transaction Monitor</h3>
            <p className="text-[11px] text-slate-500">Atomic database outcome verification</p>
          </div>
        </div>

        {latest && (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            <span className="uppercase font-extrabold">{latest.status}</span>
          </span>
        )}
      </div>

      {!latest ? (
        <p className="text-xs text-slate-400 text-center py-4">No database operations in this session.</p>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Operation:</span>
            <span className="font-mono text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {latest.operation}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Transaction Status:</span>
            <span className={`font-bold ${isSuccess ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isSuccess ? 'COMMITTED (ATOMIC)' : 'ROLLED BACK (ATOMIC)'}
            </span>
          </div>

          {latest.recordId && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Record ID:</span>
              <span className="font-mono text-emerald-700 font-bold">{latest.recordId}</span>
            </div>
          )}

          {latest.reason && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-600 block mb-1 font-medium">Rollback Cause:</span>
              <p className="text-rose-800 font-mono text-[11px] bg-rose-50 p-2.5 rounded-lg border border-rose-200 leading-relaxed font-medium">
                {latest.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
