import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  FastForward,
  AlertOctagon,
  Filter,
  MousePointer,
  Globe,
  Database,
  Terminal,
  Clock
} from 'lucide-react';

export interface TimelineEvent {
  type: string;
  timestamp: string;
  page: string;
  category: 'action' | 'error' | 'network' | 'database';
  data: any;
}

interface TimelinePlayerProps {
  events: TimelineEvent[];
  currentIndex: number;
  onSelectEvent: (index: number) => void;
  onJumpToError: () => void;
}

export const TimelinePlayer: React.FC<TimelinePlayerProps> = ({
  events,
  currentIndex,
  onSelectEvent,
  onJumpToError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [filter, setFilter] = useState<'all' | 'action' | 'error' | 'network' | 'database'>('all');

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && events.length > 0) {
      const interval = 1200 / speed;
      timer = setInterval(() => {
        if (currentIndex < events.length - 1) {
          onSelectEvent(currentIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, interval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentIndex, events.length, speed, onSelectEvent]);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    return e.category === filter;
  });

  const getEventIcon = (category: string, type: string) => {
    switch (category) {
      case 'error':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />;
      case 'network':
        return <Globe className="w-3.5 h-3.5 text-sky-600" />;
      case 'database':
        return <Database className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <MousePointer className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getEventBadgeClass = (category: string) => {
    switch (category) {
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'network':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      case 'database':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Player Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Replay Timeline</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
              {currentIndex + 1} / {events.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Step-by-step event replay synchronized with client & server state</p>
        </div>

        {/* Player Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Jump to error */}
          <button
            onClick={onJumpToError}
            id="jump-to-error-btn"
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Jump to Error</span>
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors border border-slate-200"
            title="Toggle Replay Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speed}x</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            id="play-pause-btn"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Replay
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 mr-1 font-medium">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(['all', 'action', 'error', 'network', 'database'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              filter === cat
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Chronological Event Scrubber & List */}
      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {filteredEvents.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No events matching this filter category.</p>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isCurrent = events.indexOf(evt) === currentIndex;
            const originalIndex = events.indexOf(evt);
            const timeString = new Date(evt.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            return (
              <div
                key={idx}
                onClick={() => onSelectEvent(originalIndex)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${getEventBadgeClass(
                      evt.category
                    )}`}
                  >
                    {getEventIcon(evt.category, evt.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 capitalize">
                        {evt.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200 font-semibold">
                        {evt.page}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {evt.category === 'error'
                        ? evt.data?.message || 'TypeError: Cannot read properties of undefined'
                        : evt.category === 'network'
                        ? `${evt.data?.method || 'POST'} ${evt.data?.url || '/api/customer-details'} (${evt.data?.status || 500})`
                        : evt.category === 'database'
                        ? `DB ${evt.data?.operation || 'insert'} → ${evt.data?.status || 'failed'}`
                        : evt.data?.action || evt.data?.label || evt.data?.selector || 'User interaction'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block font-medium">
                    {timeString}
                  </span>
                  {evt.category === 'error' && (
                    <span className="text-[9px] font-extrabold text-rose-700 uppercase tracking-wider bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                      CRITICAL
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
