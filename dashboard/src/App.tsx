import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SessionList, SessionItem } from './components/SessionList';
import { TimelinePlayer, TimelineEvent } from './components/TimelinePlayer';
import { StateReplay } from './components/StateReplay';
import { NetworkViewer } from './components/NetworkViewer';
import { DatabaseResultCard } from './components/DatabaseResultCard';
import { PrivacyReportCard } from './components/PrivacyReportCard';
import { PerformanceReportCard } from './components/PerformanceReportCard';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { FixVerificationModal } from './components/FixVerificationModal';
import { LoginPage } from './components/LoginPage';
import { UserManagementView } from './components/UserManagementView';
import { UserPortalShoppingView } from './components/UserPortalShoppingView';
import {
  fetchSessions,
  fetchSessionDetails,
  fetchSourceFile,
  runAIAnalysis,
  deleteSession,
  getStoredUser,
  fetchCurrentUser,
  logoutUser
} from './services/api';
import { ShieldCheck, Sparkles, AlertTriangle, Layers, Code, Play } from 'lucide-react';
import { AIResult, User } from '@safereplay/shared';

const DEFAULT_SESSION_ID = 'SR-1042';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(DEFAULT_SESSION_ID);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<'overview' | 'replay' | 'users'>('replay');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Source Code & AI State
  const [sourceData, setSourceData] = useState<{ filename: string; lines: string[] }>({
    filename: 'CustomerDetailsService.ts',
    lines: []
  });
  const [aiAnalysis, setAiAnalysis] = useState<AIResult | undefined>(undefined);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((res) => {
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        // Fallback to local stored user in prototype mode
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const loadSessionsData = async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      const data = await fetchSessions();
      if (data.sessions) {
        setSessions(data.sessions);
      }

      const targetId = selectedSessionId || (data.sessions?.[0]?.sessionId) || DEFAULT_SESSION_ID;
      const details = await fetchSessionDetails(targetId);
      if (details.session) {
        setSessionDetails(details);
        if (details.aiAnalysis) {
          setAiAnalysis(details.aiAnalysis);
        }
      }

      const src = await fetchSourceFile('CustomerDetailsService.ts');
      if (src.lines) {
        setSourceData({
          filename: src.filename,
          lines: src.lines
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadSessionsData();
    }
  }, [selectedSessionId, currentUser]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveView('replay');
    setCurrentEventIndex(0);
  };

  const handleDeleteSession = async (sessionId: string) => {
    await deleteSession(sessionId);
    loadSessionsData();
  };

  const handleRunAIAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await runAIAnalysis(selectedSessionId, 'CustomerDetailsService.ts', 48);
      if (res.success && res.analysis) {
        setAiAnalysis(res.analysis);
      }
    } catch (err) {
      console.error('AI analysis error', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setActiveView('replay');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveView('replay');
  };

  // If not authenticated, display login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // User account → shopping portal only
  if (currentUser.role === 'viewer') {
    return <UserPortalShoppingView currentUser={currentUser} onLogout={handleLogout} />;
  }


  const timelineEvents: TimelineEvent[] = sessionDetails?.timeline || [
    {
      type: 'session_start',
      timestamp: new Date().toISOString(),
      page: '/checkout',
      category: 'action',
      data: { userAgent: 'Chrome 128 (Windows 11)' }
    },
    {
      type: 'click',
      timestamp: new Date().toISOString(),
      page: '/checkout',
      category: 'action',
      data: { label: 'Submit Customer Order' }
    },
    {
      type: 'network',
      timestamp: new Date().toISOString(),
      page: '/checkout',
      category: 'network',
      data: { method: 'POST', url: '/api/customer-details', status: 500, duration: 820 }
    },
    {
      type: 'database_result',
      timestamp: new Date().toISOString(),
      page: '/checkout',
      category: 'database',
      data: { operation: 'customer_details_insert', status: 'failed', reason: 'Database transaction rolled back: address postalCode normalization error' }
    },
    {
      type: 'runtime_error',
      timestamp: new Date().toISOString(),
      page: '/checkout',
      category: 'error',
      data: { message: 'TypeError: Cannot read properties of undefined (reading toUpperCase)', line: 48, file: 'CustomerDetailsService.ts' }
    }
  ];

  const currentEvent = timelineEvents[currentEventIndex] || timelineEvents[0];

  const handleJumpToError = () => {
    const errorIdx = timelineEvents.findIndex((e) => e.category === 'error');
    if (errorIdx !== -1) {
      setCurrentEventIndex(errorIdx);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Navbar with User Profile & Role Info */}
      <Navbar
        currentSessionId={selectedSessionId}
        currentUser={currentUser}
        onRefresh={loadSessionsData}
        isRefreshing={isRefreshing}
        onSelectView={setActiveView}
        activeView={activeView}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {activeView === 'users' && currentUser.role === 'admin' ? (
          /* Admin User & Permissions Console */
          <UserManagementView />
        ) : activeView === 'overview' ? (
          /* Session Overview Tab */
          <div className="space-y-6">
            <SessionList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PrivacyReportCard report={sessionDetails?.session?.privacyReport} />
              <PerformanceReportCard report={sessionDetails?.session?.performanceReport} />
            </div>
          </div>
        ) : (
          /* Timeline & AI Replay Tab */
          <div className="space-y-8">
            {/* Top Replay & State Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Replay Timeline Controls */}
              <div className="lg:col-span-6 space-y-6">
                <TimelinePlayer
                  events={timelineEvents}
                  currentIndex={currentEventIndex}
                  onSelectEvent={setCurrentEventIndex}
                  onJumpToError={handleJumpToError}
                />
              </div>

              {/* Right: Visual State Reproduction */}
              <div className="lg:col-span-6 space-y-6">
                <StateReplay
                  currentEvent={currentEvent}
                  currentIndex={currentEventIndex}
                  totalEvents={timelineEvents.length}
                />
              </div>
            </div>

            {/* Network & Database Monitoring Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NetworkViewer networkEvents={sessionDetails?.networkEvents || []} />
              <DatabaseResultCard results={sessionDetails?.dbResults || []} />
            </div>

            {/* Source Code Viewer with Red Highlighted Error Line */}
            <div>
              <SourceCodeViewer
                filename={sourceData.filename}
                lines={sourceData.lines}
                highlightLine={48}
              />
            </div>

            {/* AI Root Cause Analysis & Fix Verification Panel */}
            <div>
              <AIAnalysisPanel
                analysis={aiAnalysis}
                isLoading={isAiLoading}
                userRole={currentUser.role}
                onRunAnalysis={handleRunAIAnalysis}
                onTestFix={() => {
                  if (currentUser.role !== 'viewer') {
                    setIsFixModalOpen(true);
                  }
                }}
              />
            </div>

            {/* Privacy & Performance Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PrivacyReportCard report={sessionDetails?.session?.privacyReport} />
              <PerformanceReportCard report={sessionDetails?.session?.performanceReport} />
            </div>
          </div>
        )}
      </main>

      {/* Fix Verification Modal */}
      <FixVerificationModal
        isOpen={isFixModalOpen}
        sessionId={selectedSessionId}
        onClose={() => setIsFixModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SafeReplay Platform. Privacy-Preserving AI Web Debugging Studio.</p>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Privacy Status: SAFE (0 Tokens Leaked)
            </span>
            <span className="text-slate-500 font-mono font-medium">Session: {selectedSessionId}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
