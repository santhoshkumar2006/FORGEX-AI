import React from 'react';
import { TimelineEvent } from './TimelinePlayer';
import { Shield, Lock, AlertCircle, ShoppingBag, CheckCircle, CreditCard } from 'lucide-react';

interface StateReplayProps {
  currentEvent: TimelineEvent | null;
  currentIndex: number;
  totalEvents: number;
}

export const StateReplay: React.FC<StateReplayProps> = ({
  currentEvent,
  currentIndex,
  totalEvents
}) => {
  const isErrorState = currentEvent?.category === 'error' || currentEvent?.data?.status === 'failed' || currentEvent?.data?.status === 500;
  const isCheckout = currentEvent?.page === '/checkout' || (currentEvent?.data?.action && currentEvent.data.action.includes('checkout'));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Visual State Reproduction</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              PII Redacted
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Rendered DOM view reconstructed from safe session events</p>
        </div>
        <div className="text-xs font-mono text-slate-500 font-medium">
          Page: <span className="text-emerald-700 font-bold">{currentEvent?.page || '/checkout'}</span>
        </div>
      </div>

      {/* Simulated Browser Frame */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-md">
        {/* Browser Top Bar */}
        <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="bg-slate-50 px-3 py-0.5 rounded-md border border-slate-200 text-[11px] text-slate-600 font-mono flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>https://safereplay-store.internal{currentEvent?.page || '/checkout'}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-medium">Viewport: 1920x1080</span>
        </div>

        {/* Browser Content Area */}
        <div className="p-6 min-h-[260px] flex flex-col justify-center">
          {isErrorState ? (
            /* Error State UI */
            <div className="max-w-md mx-auto w-full bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-3 animate-in fade-in zoom-in duration-200 shadow-sm">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">Controlled Transaction Error</h4>
                <p className="text-xs text-rose-700 mt-1 font-mono">
                  {currentEvent?.data?.message || 'Database transaction rolled back: address postalCode normalization error'}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-[11px] text-left text-slate-700 shadow-xs">
                <p className="text-slate-500 font-medium">Database Status: <span className="text-rose-600 font-bold">Failed / Rolled Back</span></p>
                <p className="text-slate-500 font-medium">HTTP Status: <span className="text-rose-600 font-bold">500 Internal Error</span></p>
              </div>
            </div>
          ) : isCheckout ? (
            /* Checkout Form State */
            <div className="max-w-md mx-auto w-full bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Synthetic Checkout Form</span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  data-private
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Name:</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded font-mono text-emerald-800 font-bold">
                    [MASKED]
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Email:</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded font-mono text-emerald-800 font-bold">
                    [MASKED_EMAIL]
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Address:</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded font-mono text-emerald-800 font-bold">
                    [MASKED_ADDRESS]
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">CVV (Password):</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded font-mono text-emerald-800 font-bold">
                    ***
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Product Catalog State */
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto border border-emerald-200">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Product Catalog Active</h4>
                <p className="text-xs text-slate-500 mt-1">
                  User interacting with product cards and cart drawer
                </p>
              </div>
              {currentEvent?.data?.productName && (
                <div className="inline-block bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                  Target: {currentEvent.data.productName}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
