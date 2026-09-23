import React from 'react';
import { Code, AlertTriangle, FileCode, Copy, Check } from 'lucide-react';

interface SourceCodeViewerProps {
  filename: string;
  lines: string[];
  highlightLine?: number;
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({
  filename,
  lines,
  highlightLine = 48
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <FileCode className="w-4 h-4 text-emerald-600" />
          <span className="font-mono font-bold text-slate-900">{filename}</span>
          <span className="text-[11px] font-mono text-slate-400 font-medium">
            ({lines.length} lines)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {highlightLine && (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Faulty Line: {highlightLine}
            </span>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-500" /> Copy File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 bg-slate-900 font-mono text-xs overflow-x-auto max-h-96 custom-scrollbar leading-relaxed rounded-b-2xl">
        {lines.map((lineContent, idx) => {
          const lineNumber = idx + 1;
          const isErrorLine = lineNumber === highlightLine;

          return (
            <div
              key={lineNumber}
              className={`flex items-center px-2 py-0.5 rounded ${
                isErrorLine
                  ? 'bg-red-950/80 border-l-4 border-rose-500 text-red-200 font-bold shadow-sm'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <span
                className={`w-10 select-none text-right pr-4 text-[11px] ${
                  isErrorLine ? 'text-rose-400 font-bold' : 'text-slate-500'
                }`}
              >
                {lineNumber}
              </span>
              <span className="whitespace-pre overflow-visible">
                {lineContent || ' '}
              </span>
              {isErrorLine && (
                <span className="ml-auto text-[10px] text-rose-300 font-extrabold uppercase tracking-widest bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40 select-none shrink-0">
                  TypeError Line 48
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
