import React from 'react';
import { Globe, ArrowUpRight, CheckCircle2, AlertCircle, Clock, Shield } from 'lucide-react';
import { NetworkEvent } from '@safereplay/shared';

interface NetworkViewerProps {
  networkEvents: NetworkEvent[];
}

export const NetworkViewer: React.FC<NetworkViewerProps> = ({ networkEvents }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
            <Globe className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Safe Network Interceptor</h3>
            <p className="text-[11px] text-slate-500">Captured HTTP metadata with sanitized headers</p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
          {networkEvents.length} Intercepted Calls
        </span>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1 text-xs">
        {networkEvents.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No network requests recorded.</p>
        ) : (
          networkEvents.map((net, idx) => {
            const isError = net.status >= 400 || net.status === 0;

            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        net.method === 'POST'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {net.method}
                    </span>
                    <span className="font-mono text-slate-800 font-bold truncate max-w-xs">
                      {net.url}
                    </span>
                  </div>

                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                      isError
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isError ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{net.status || 'FAILED'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" /> Duration: {net.duration}ms
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <Shield className="w-3 h-3 text-emerald-600" /> Headers Sanitized (No Tokens)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
