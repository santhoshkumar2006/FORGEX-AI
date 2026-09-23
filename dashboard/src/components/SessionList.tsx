import React from 'react';
import { Play, AlertTriangle, CheckCircle2, Shield, Trash2, Clock, Globe } from 'lucide-react';

export interface SessionItem {
  sessionId: string;
  page: string;
  browser: string;
  status: string;
  hasError: boolean;
  dbStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionListProps {
  sessions: SessionItem[];
  selectedSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onDeleteSession
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recorded Debugging Sessions</h2>
          <p className="text-xs text-slate-500">All sessions are privacy-scrubbed before storage</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg shadow-sm">
          {sessions.length} Sessions Available
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Session ID</th>
              <th className="py-3.5 px-4">Page</th>
              <th className="py-3.5 px-4">Runtime Error</th>
              <th className="py-3.5 px-4">Database Status</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No sessions recorded yet. Open the Demo Store to generate events!
                </td>
              </tr>
            ) : (
              sessions.map((s) => {
                const isSelected = s.sessionId === selectedSessionId;
                const formattedTime = new Date(s.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <tr
                    key={s.sessionId}
                    onClick={() => onSelectSession(s.sessionId)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/60 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {s.sessionId}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px] font-semibold">
                        {s.page || '/checkout'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {s.hasError ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Database save failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> None
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.dbStatus === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                          Rolled Back
                        </span>
                      ) : s.dbStatus === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          Committed
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Active</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="flex items-center gap-1 truncate max-w-[120px] font-medium">
                        <Globe className="w-3 h-3 text-slate-400" /> {s.browser || 'Chrome/Windows'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> {formattedTime}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectSession(s.sessionId)}
                          id={`replay-session-${s.sessionId}`}
                          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white px-2.5 py-1 rounded-lg border border-emerald-200 transition-all font-bold text-[11px]"
                        >
                          <Play className="w-3 h-3 fill-current" /> Replay
                        </button>
                        <button
                          onClick={() => onDeleteSession(s.sessionId)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
