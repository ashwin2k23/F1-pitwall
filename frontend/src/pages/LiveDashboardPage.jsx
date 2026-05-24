// LiveDashboardPage.jsx — Full live race dashboard: timing board + tire strategy + race insights.
// New page at /live — does NOT modify any existing page.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';
import LiveTimingBoard from '../components/live/LiveTimingBoard';
import TireStrategyTimeline from '../components/live/TireStrategyTimeline';
import RaceInsightsPanel from '../components/live/RaceInsightsPanel';
import f1Api from '../utils/f1Api';

const SessionBadge = ({ session }) => {
  const isLive = session?.status === 'Started';
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest font-mono border ${
      isLive
        ? 'border-red-600 text-red-600 bg-red-600/10'
        : 'border-slate-400 text-slate-400 bg-transparent'
    }`}>
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}
      {isLive ? 'Live' : 'No Active Session'} •{' '}
      {session?.session_name || 'Waiting'}
    </div>
  );
};

const LiveDashboardPage = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const detectSession = async () => {
      // --- Primary: check Ergast schedule for active race weekend ---
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();
        // Use LOCAL date (not UTC) — toISOString() gives wrong date for UTC+5:30 users
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        for (const race of races) {
          // Collect all session dates for this race weekend
          const sessionDates = [
            race.FirstPractice?.date,
            race.SecondPractice?.date,
            race.ThirdPractice?.date,
            race.Sprint?.date,
            race.SprintQualifying?.date,
            race.Qualifying?.date,
            race.date,
          ].filter(Boolean);

          // Is today within this race weekend?
          if (sessionDates.includes(todayStr)) {
            // Determine which session is today
            let sessionName = 'Race Weekend';
            if (race.date === todayStr) sessionName = 'Race';
            else if (race.Qualifying?.date === todayStr) sessionName = 'Qualifying';
            else if (race.Sprint?.date === todayStr) sessionName = 'Sprint';
            else if (race.ThirdPractice?.date === todayStr) sessionName = 'Practice 3';
            else if (race.SecondPractice?.date === todayStr) sessionName = 'Practice 2';
            else if (race.FirstPractice?.date === todayStr) sessionName = 'Practice 1';

            setSession({
              status: 'Started',
              session_name: sessionName,
              race_name: race.raceName,
              circuit: race.Circuit?.circuitName,
            });
            return; // Found — no need to check further
          }
        }
      } catch (e) {
        console.warn('[LiveDashboardPage] Ergast schedule check failed:', e);
      }

      // --- Secondary: try OpenF1 (requires auth, best-effort) ---
      try {
        const data = await f1Api.getLiveSession();
        if (Array.isArray(data) && data.length > 0 && data[0].status === 'Started') {
          setSession(data[0]);
        }
      } catch (_) {}
    };

    detectSession();
  }, []);

  return (
    <div className="pt-2 pb-20 animate-fade-in">
      {/* Page header */}
      <div className="mb-8 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter leading-none">
              Live <span className="text-red-600 font-bold italic">Race.</span>
            </h1>
            <p className="mt-3 text-slate-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              OpenF1 Telemetry • Auto-refresh 15s
            </p>
          </div>
          <div>
            <SessionBadge session={session} />
          </div>
        </div>
      </div>

      {/* Info banner when no session */}
      {(!session || session.status !== 'Started') && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start gap-3 p-4 border border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400"
        >
          <Radio className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono leading-relaxed">
            No race weekend scheduled today. Timing board and tire strategy show last race results.
            Live data activates automatically on race weekends.
          </p>
        </motion.div>
      )}

      {/* Live session banner */}
      {session?.status === 'Started' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start gap-3 p-4 border border-red-500/30 bg-red-500/5 text-red-400"
        >
          <span className="relative flex h-3 w-3 mt-0.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <p className="text-xs font-mono leading-relaxed">
            <span className="font-bold uppercase tracking-widest">🔴 Live Session Active</span>{' — '}
            {session.race_name} · {session.session_name}
            {session.circuit && ` · ${session.circuit}`}
          </p>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Left: Timing + Tire Strategy */}
        <div className="xl:col-span-8 space-y-8">

          {/* Live timing board */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            id="live-timing-section"
          >
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                Driver <span className="text-red-600 italic">Positions</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Via OpenF1</span>
            </div>
            <div className="editorial-border">
              <div className="pt-4">
                <LiveTimingBoard />
              </div>
            </div>
          </motion.section>

          {/* Tire strategy timeline */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            id="tire-strategy-section"
          >
            <div className="flex items-end justify-between mb-3">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                Tire <span className="text-red-600 italic">Strategy</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Stint Timeline</span>
            </div>
            <div className="editorial-border">
              <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 p-5 pt-6">
                <TireStrategyTimeline totalLaps={57} />
              </div>
            </div>
          </motion.section>
        </div>

        {/* Right: Race insights */}
        <motion.div
          className="xl:col-span-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          id="race-insights-section"
        >
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
              Race <span className="text-red-600 italic">Insights</span>
            </h2>
          </div>
          <div className="editorial-border">
            <div className="pt-4">
              <RaceInsightsPanel />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveDashboardPage;
