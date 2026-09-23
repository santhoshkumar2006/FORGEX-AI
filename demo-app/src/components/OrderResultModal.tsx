import React from 'react';
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Shield, Sparkles } from 'lucide-react';

interface OrderResultModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  recordId?: string;
  reason?: string;
  sessionId: string;
  onClose: () => void;
  onRetry: () => void;
}

export const OrderResultModal: React.FC<OrderResultModalProps> = ({
  isOpen,
  isSuccess,
  recordId,
  reason,
  sessionId,
  onClose,
  onRetry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isSuccess ? 'Order Placed Successfully!' : 'Controlled Error Detected'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isSuccess
                ? 'Your synthetic order details have been securely committed to the database.'
                : 'A simulated backend database transaction rollback occurred during checkout.'}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Session ID:</span>
              <span className="font-mono text-emerald-700 font-bold">{sessionId}</span>
            </div>

            {isSuccess && recordId && (
              <div className="flex justify-between items-center text-slate-600">
                <span>Database Record:</span>
                <span className="font-mono text-slate-900 font-bold">{recordId}</span>
              </div>
            )}

            {!isSuccess && (
              <>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Database Status:</span>
                  <span className="text-rose-600 font-bold">Rolled Back</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1 font-medium">Failure Reason:</span>
                  <p className="text-rose-800 font-mono text-[11px] bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
                    {reason || 'Database transaction rolled back: address postalCode normalization error'}
                  </p>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Privacy Report: SAFE
              </span>
              <span>0 Leaked Tokens</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            {!isSuccess && (
              <a
                href={`http://localhost:3001`}
                target="_blank"
                rel="noreferrer"
                id="open-dashboard-modal-btn"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Inspect in SafeReplay Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <div className="flex gap-3">
              {!isSuccess && (
                <button
                  onClick={onRetry}
                  id="retry-order-btn"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Checkout</span>
                </button>
              )}

              <button
                onClick={onClose}
                id="close-modal-btn"
                className={`py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200 ${
                  isSuccess ? 'w-full' : 'px-5'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
