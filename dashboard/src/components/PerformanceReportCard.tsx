import React from 'react';
import { Gauge, Zap, Activity, Cpu } from 'lucide-react';
import { PerformanceReport } from '@safereplay/shared';

interface PerformanceReportCardProps {
  report?: PerformanceReport;
}

export const PerformanceReportCard: React.FC<PerformanceReportCardProps> = ({ report }) => {
  const pageLoad = report?.pageLoadDuration ?? 1420;
  const overhead = report?.sdkOverheadPercent ?? 1.8;
  const eventCount = report?.eventCount ?? 18;
  const payloadSize = report?.payloadSizeBytes ?? 3840;
  const longTasks = report?.longTaskCount ?? 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
            <Gauge className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">SDK Performance & Overhead</h3>
            <p className="text-[11px] text-slate-500">Zero-impact lightweight runtime profiling</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Overhead: {overhead}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Page Load Time</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{pageLoad}ms</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Event Ingestion Count</span>
          <span className="text-base font-extrabold text-sky-700 mt-0.5 block">{eventCount} Events</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Payload Network Size</span>
          <span className="text-base font-extrabold text-emerald-600 mt-0.5 block">
            {(payloadSize / 1024).toFixed(1)} KB
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-medium">Long Task Blocks (&gt;50ms)</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">{longTasks}</span>
        </div>
      </div>
    </div>
  );
};
