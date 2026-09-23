import React, { useState } from 'react';
import {
  Code2,
  AlertTriangle,
  Check,
  Copy,
  Wrench,
  Sparkles,
  Loader2
} from 'lucide-react';

import { AIResult } from '@safereplay/shared';

interface AIAnalysisPanelProps {
  analysis?: AIResult;
  isLoading: boolean;
  userRole?: string;
  onRunAnalysis: () => void;
  onTestFix: () => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  analysis,
  isLoading,
  userRole = 'developer',
  onRunAnalysis,
  onTestFix
}) => {
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const handleCopy = () => {
    if (analysis?.correctedCode) {
      navigator.clipboard.writeText(analysis.correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };




  if (!analysis) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
          <Code2 className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">AI Root Cause & Code Correction</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Analyze runtime errors, database transaction rollbacks, and source code context to generate safe fix suggestions.
          </p>
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={isLoading}
          id="trigger-ai-analysis-btn"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Context & Error...</span>
            </>
          ) : (
            <>
              <Code2 className="w-4 h-4" />
              <span>Generate AI Root-Cause Analysis</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header with Severity & Warning */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-2xs">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-blue-600 stroke-[1.8]" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{analysis.errorTitle}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Function <code className="text-blue-700 font-mono font-bold">{analysis.function}()</code> in{' '}
              <code className="text-slate-700 font-mono font-semibold">{analysis.file}:{analysis.startLine}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Severity: {analysis.severity}
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </span>
          <span className="bg-slate-100 text-slate-700 text-[11px] font-mono px-2 py-1 rounded-lg border border-slate-200 font-semibold">
            Provider: {analysis.provider}
          </span>
        </div>
      </div>

      {/* Mandatory Developer Review Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-bold">AI-generated suggestion — developer review required.</span>
      </div>

      {/* Root Cause & Explanation */}
      <div className="space-y-3 text-xs">
        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
            Root Cause Diagnosis
          </h4>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {analysis.rootCause}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
            Recommended Resolution
          </h4>
          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {analysis.explanation}
          </p>
        </div>
      </div>

      {/* Side-by-Side Diff View / Code Box */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Suggested Fix Snippet
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDiff(!showDiff)}
              id="show-diff-btn"
              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              {showDiff ? 'Hide Difference' : 'Show Difference'}
            </button>
            <button
              onClick={handleCopy}
              id="copy-fix-btn"
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Fix
                </>
              )}
            </button>
          </div>
        </div>

        {showDiff ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {/* Original Buggy Code */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 overflow-x-auto">
              <div className="text-[10px] font-bold text-rose-700 mb-2 uppercase">Original (Faulty Line 48)</div>
              <pre className="text-rose-900 leading-relaxed">
{`// LINE 48: Buggy Access
const normalizedZip = 
  customer.address.postalCode.toUpperCase();`}
              </pre>
            </div>

            {/* Corrected Code */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 overflow-x-auto">
              <div className="text-[10px] font-bold text-emerald-700 mb-2 uppercase">Corrected (Safe Null-Safe)</div>
              <pre className="text-emerald-900 leading-relaxed">
{`// FIXED: Safe Optional Chaining
const normalizedZip = 
  customer.address?.postalCode?.toUpperCase() ?? 'N/A';`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
            <pre>{analysis.correctedCode}</pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onTestFix}
            id="test-fix-btn"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Test Fix (Run Verification)</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Fix</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 italic">
          Fix verification runs in an isolated sandbox environment
        </span>
      </div>
    </div>
  );
};
