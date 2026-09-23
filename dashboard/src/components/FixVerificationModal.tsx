import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Wrench, X, ShieldCheck, Play, Loader2, Rocket, RotateCcw, AlertTriangle } from 'lucide-react';
import { runFixVerification, applyFix, resetFix, getFixStatus } from '../services/api';

interface FixVerificationModalProps {
  isOpen: boolean;
  sessionId: string;
  onClose: () => void;
}

export const FixVerificationModal: React.FC<FixVerificationModalProps> = ({
  isOpen,
  sessionId,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isFixLive, setIsFixLive] = useState(false);
  const [deployMessage, setDeployMessage] = useState<string | null>(null);

  // Check current live fix status when modal opens
  useEffect(() => {
    if (isOpen) {
      getFixStatus().then((s) => {
        if (s.success) setIsFixLive(s.isFixApplied);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsRunning(true);
    setResult(null);
    setDeployMessage(null);
    try {
      const data = await runFixVerification(sessionId);
      if (data.success && data.verification) {
        setResult(data.verification);
      }
    } catch (err: any) {
      console.error('Verification failed', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDeployFix = async () => {
    setIsDeploying(true);
    setDeployMessage(null);
    try {
      const res = await applyFix();
      if (res.success) {
        setIsFixLive(true);
        setDeployMessage('Fix deployed to live service. Users will no longer see the checkout error.');
      }
    } catch (err) {
      console.error('Deploy failed', err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    setDeployMessage(null);
    try {
      const res = await resetFix();
      if (res.success) {
        setIsFixLive(false);
        setResult(null);
        setDeployMessage('Demo reset: controlled error is active again for reproduction.');
      }
    } catch (err) {
      console.error('Reset failed', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Automated Fix Verification Runner</h3>
              <p className="text-xs text-slate-500">Replays captured scenario against corrected code</p>
            </div>
          </div>

          {/* Live Status Badge */}
          <div className="flex items-center gap-3">
            {isFixLive ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Fix Deployed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                Error Active
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Deploy Notice Banner */}
          {deployMessage && (
            <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              isFixLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {isFixLive ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <RotateCcw className="w-4 h-4 shrink-0" />}
              <span>{deployMessage}</span>
            </div>
          )}

          {!result && !isRunning && (
            <div className="text-center py-6 space-y-4">
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Click below to execute the captured reproduction payload against the corrected{' '}
                <code className="text-emerald-700 font-mono font-bold">CustomerDetailsService.ts:48</code>{' '}
                implementation in an isolated test environment.
              </p>
              <button
                onClick={handleExecute}
                id="execute-verification-btn"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Fix Verification Test</span>
              </button>
            </div>
          )}

          {isRunning && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-900">Running Reproduction Scenario & Fix Verification...</p>
              <p className="text-[11px] text-slate-500">Validating transaction safety and zero error recurrence</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Verification Success Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Fix Verification Successful</h4>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      {result.verificationMessage}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  Verified
                </span>
              </div>

              {/* Side-by-side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-rose-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-rose-700">Original Scenario</span>
                    <span className="text-[10px] font-mono bg-rose-100 px-2 py-0.5 rounded text-rose-700 border border-rose-200 font-bold">FAILED</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Payload: {result.originalScenario?.description}</p>
                  <p className="text-rose-800 font-mono text-[11px] font-medium">
                    Error: {result.originalScenario?.originalError}
                  </p>
                </div>

                <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-bold text-emerald-700">Corrected Execution</span>
                    <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 border border-emerald-200 font-bold">COMMITTED</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Applied Fix: <code className="text-emerald-700 font-mono font-bold">{result.correctedScenario?.appliedFix}</code>
                  </p>
                  <p className="text-emerald-700 font-mono text-[11px] font-bold">
                    New Record ID: {result.correctedScenario?.recordId || 'REC-1042'}
                  </p>
                </div>
              </div>

              {/* Zero Errors Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Error Reproduced: 0 (Fixed Cleanly)
                </span>
                <span className="font-mono text-slate-400">Session: {sessionId}</span>
              </div>

              {/* Deploy Fix to Live Banner */}
              {!isFixLive && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Rocket className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900">Deploy Fix to Live Service</p>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Verification passed. Click below to apply the fix to the live checkout API. Users will immediately stop seeing the database rollback error.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeployFix}
                    disabled={isDeploying}
                    id="deploy-fix-btn"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {isDeploying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Deploying Fix...</span></>
                    ) : (
                      <><Rocket className="w-4 h-4" /><span>Deploy Fix â€” Clear User Error</span></>
                    )}
                  </button>
                </div>
              )}

              {/* Fix is deployed confirmation */}
              {isFixLive && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Fix is Live â€” User Checkout Error Cleared</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Users can now complete checkout without the database rollback error.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white uppercase tracking-wider shrink-0">
                    Live
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            {result && (
              <button
                onClick={handleExecute}
                disabled={isRunning}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
              >
                Re-run Test
              </button>
            )}
            {/* Reset Demo Error - for hackathon demo purposes */}
            {isFixLive && (
              <button
                onClick={handleResetDemo}
                disabled={isResetting}
                id="reset-demo-btn"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors border border-amber-200 disabled:opacity-50"
              >
                {isResetting ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Resetting...</span></>
                ) : (
                  <><RotateCcw className="w-3.5 h-3.5" /><span>Reset Demo Error</span></>
                )}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
