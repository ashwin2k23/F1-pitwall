// LiveTimingBoard.jsx — Real-time driver positions, gaps, and lap count.
// Uses OpenF1 API. Auto-polls every 15 s. New component — does NOT touch existing code.

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Zap } from 'lucide-react';
import SkeletonLoader from '../ui/SkeletonLoader';
import f1Api from '../../utils/f1Api';

const TIRE_COLORS = {
  SOFT: '#ef4444',
  MEDIUM: '#f59e0b',
  HARD: '#e2e8f0',
  INTERMEDIATE: '#22c55e',
  WET: '#3b82f6',
};

const TIRE_LABELS = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
};

const TireBadge = ({ compound }) => {
  const c = (compound || '').toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black border-2"
      style={{
        borderColor: TIRE_COLORS[c] || '#888',
        color: c === 'HARD' ? '#111' : TIRE_COLORS[c] || '#888',
        backgroundColor: c === 'HARD' ? '#e2e8f0' : 'transparent',
      }}
      title={compound}
    >
      {TIRE_LABELS[c] || '?'}
    </span>
  );
};

const LiveTimingBoard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [driversData, intervalsData, stintsData] = await Promise.all([
        f1Api.getLiveDrivers(),
        f1Api.getLiveIntervals(),
        f1Api.getLiveStints(),
      ]);

      // Build driver map
      const driverMap = {};
      (driversData || []).forEach((d) => {
        driverMap[d.driver_number] = d;
      });

      // Latest interval per driver
      const latestIntervals = {};
      (intervalsData || []).forEach((r) => {
        latestIntervals[r.driver_number] = r;
      });

      // Latest stint per driver
      const latestStints = {};
      (stintsData || []).forEach((s) => {
        if (
          !latestStints[s.driver_number] ||
          s.stint_number > latestStints[s.driver_number].stint_number
        ) {
          latestStints[s.driver_number] = s;
        }
      });

      // Merge — sort by position (gap ascending)
      const merged = Object.entries(latestIntervals)
        .map(([driverNum, interval]) => {
          const driver = driverMap[driverNum] || {};
          const stint = latestStints[driverNum] || {};
          return {
            driverNumber: driverNum,
            acronym: driver.name_acronym || `#${driverNum}`,
            fullName: driver.full_name || `Driver ${driverNum}`,
            teamColor: driver.team_colour ? `#${driver.team_colour}` : '#ef4444',
            teamName: driver.team_name || '—',
            gap: interval.gap_to_leader,
            lap: stint.lap_start || '—',
            compound: stint.compound || '?',
            pitCount: stint.stint_number ? stint.stint_number - 1 : 0,
            isFastestLap: interval.gap_to_leader === 0, // Leader
          };
        })
        .sort((a, b) => {
          if (a.gap === 0) return -1;
          if (b.gap === 0) return 1;
          if (typeof a.gap !== 'number') return 1;
          if (typeof b.gap !== 'number') return -1;
          return a.gap - b.gap;
        });

      if (merged.length > 0) {
        setRows(merged);
        setError(null);
      } else {
        setError('no-session');
      }
      setLastUpdated(new Date());
    } catch (e) {
      console.error('[LiveTimingBoard] fetch error:', e);
      setError('fetch-error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(), 15000);
    return () => clearInterval(timer);
  }, [fetchData]);

  const formatGap = (gap) => {
    if (gap === 0 || gap === null) return 'LEADER';
    if (typeof gap === 'string') return gap;
    return `+${Number(gap).toFixed(3)}s`;
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            Live Timing
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            id="live-timing-refresh-btn"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-1.5 border border-slate-200 dark:border-slate-700 hover:border-red-600 hover:text-red-600 transition-colors rounded-sm text-slate-500"
            title="Refresh timing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {loading ? (
          <SkeletonLoader rows={8} />
        ) : error === 'no-session' ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">🏁</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Live Session</p>
            <p className="text-xs text-slate-400 mt-1">Live timing updates when a session is active.</p>
          </div>
        ) : error === 'fetch-error' ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Data Unavailable</p>
            <p className="text-xs text-slate-400 mt-1">Check your connection or try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2 pr-4 w-8">P</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2 pr-4">Driver</th>
                  <th className="text-left text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2 pr-4 hidden md:table-cell">Team</th>
                  <th className="text-center text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2 pr-4">Tire</th>
                  <th className="text-center text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2 pr-4 hidden sm:table-cell">Pits</th>
                  <th className="text-right text-[10px] font-mono uppercase tracking-widest text-slate-400 py-2">Gap</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rows.map((row, idx) => (
                    <motion.tr
                      key={row.driverNumber}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-red-500 transition-colors">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: row.teamColor }}
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-red-600 transition-colors leading-none">
                              {row.acronym}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 leading-none mt-0.5 hidden sm:block">
                              {row.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        <span className="text-xs font-mono text-slate-500">{row.teamName}</span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <TireBadge compound={row.compound} />
                      </td>
                      <td className="py-3 pr-4 text-center hidden sm:table-cell">
                        <span className="text-xs font-mono text-slate-500">{row.pitCount}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`text-xs font-mono font-bold ${
                            row.gap === 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatGap(row.gap)}
                        </span>
                        {row.gap === 0 && (
                          <Zap className="w-3 h-3 text-red-500 inline ml-1" />
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTimingBoard;
