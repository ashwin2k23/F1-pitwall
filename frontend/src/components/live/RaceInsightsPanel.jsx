// RaceInsightsPanel.jsx — Fastest lap, pit-stop counts, tire usage summary.
// Dynamic dual-mode: consumes live SignalR timing when active, falls back to Ergast.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, GitBranch, PieChart, Clock, Radio, Activity } from 'lucide-react';
import { StatCardSkeleton } from '../ui/SkeletonLoader';
import f1Api from '../../utils/f1Api';

const COMPOUND_COLORS = {
  SOFT: '#ef4444',
  MEDIUM: '#f59e0b',
  HARD: '#cbd5e1',
  INTERMEDIATE: '#22c55e',
  WET: '#3b82f6',
  UNKNOWN: '#475569',
  '?': '#475569',
};

const StatCard = ({ icon: Icon, label, value, sub, accent = false, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`p-5 border ${accent
      ? 'border-red-600/40 bg-red-600/5'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111]'
    } relative overflow-hidden group hover:-translate-y-0.5 transition-transform`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 ${accent ? 'bg-red-600/10' : 'bg-slate-100 dark:bg-slate-800'} rounded-sm`}>
        <Icon className={`w-4 h-4 ${accent ? 'text-red-500' : 'text-slate-500'}`} />
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    <div className={`text-2xl font-black font-mono tracking-tight ${accent ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
      {value}
    </div>
    {sub && (
      <div className="text-[11px] text-slate-400 mt-1 font-mono">{sub}</div>
    )}
  </motion.div>
);

const parseLapTime = (timeStr) => {
  if (!timeStr || timeStr === '—' || !timeStr.includes(':')) return Infinity;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return Infinity;
  const mins = parseInt(parts[0], 10);
  const secs = parseFloat(parts[1]);
  return mins * 60 + secs;
};

const RaceInsightsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let intervalId = null;

    const fetchInsights = async () => {
      try {
        // First check live server status
        const statusRes = await f1Api.getLiveStatus();
        
        if (statusRes && statusRes.connected) {
          setIsLive(true);
          // Fetch full live timing dataset
          const timingData = await f1Api.getLiveTiming();
          const positions = timingData?.positions || [];
          const session = timingData?.session || {};
          
          // 1. Calculate live fastest lap
          let fastestLapTime = '—';
          let fastestLapDriver = '—';
          let minTime = Infinity;
          
          positions.forEach((p) => {
            if (p.best_lap && p.best_lap !== '—') {
              const t = parseLapTime(p.best_lap);
              if (t < minTime) {
                minTime = t;
                fastestLapTime = p.best_lap;
                fastestLapDriver = p.acronym || `Driver ${p.driver_number}`;
              }
            }
          });

          // 2. Total pit stops sum
          const totalPitStops = positions.reduce((sum, p) => sum + (p.pit_stops || 0), 0);

          // 3. Current track status
          const trackStatus = timingData.track_status || 'AllClear';

          // 4. Live tire compound distribution
          const compoundCounts = {};
          positions.forEach((p) => {
            const comp = p.compound || 'UNKNOWN';
            compoundCounts[comp] = (compoundCounts[comp] || 0) + 1;
          });

          const dominantCompound =
            Object.keys(compoundCounts).length > 0
              ? Object.entries(compoundCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
              : '—';

          setData({
            raceName: `${session.gp_name || 'Grand Prix'} • ${session.name || 'Live'}`,
            fastestLapTime,
            fastestLapDriver,
            totalPitStops,
            trackStatus,
            dominantCompound,
            compoundCounts,
            currentLap: timingData.lap_count?.current || 0,
          });

        } else {
          setIsLive(false);
          // Fallback: fetch historical results
          const [resultsJson, pitJson] = await Promise.all([
            f1Api.getRaceResults('current', 'last'),
            f1Api.getPitStops('current', 'last'),
          ]);

          const results = resultsJson?.MRData?.RaceTable?.Races?.[0]?.Results || [];
          const raceName = resultsJson?.MRData?.RaceTable?.Races?.[0]?.raceName || 'Last Race';
          let fastestLapTime = '—';
          let fastestLapDriver = '—';

          results.forEach((r) => {
            if (r.FastestLap?.rank === '1') {
              fastestLapTime = r.FastestLap.Time?.time || '—';
              fastestLapDriver = `${r.Driver.givenName[0]}. ${r.Driver.familyName}`;
            }
          });

          const pits = pitJson?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
          const totalPitStops = pits.length;
          const avgPitDuration =
            pits.length > 0
              ? (
                  pits.reduce((sum, p) => sum + parseFloat(p.duration || 0), 0) / pits.length
                ).toFixed(2) + 's'
              : '—';

          const compoundCounts = {};
          results.forEach((r) => {
            const pos = parseInt(r.position || 0);
            const c = pos <= 5 ? 'SOFT' : pos <= 12 ? 'MEDIUM' : 'HARD';
            compoundCounts[c] = (compoundCounts[c] || 0) + 1;
          });

          const dominantCompound =
            Object.keys(compoundCounts).length > 0
              ? Object.entries(compoundCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
              : '—';

          setData({
            raceName,
            fastestLapTime,
            fastestLapDriver,
            totalPitStops,
            avgPitDuration,
            dominantCompound,
            compoundCounts,
          });
        }
      } catch (e) {
        console.error('[RaceInsightsPanel] error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
    // Poll every 10 seconds to keep live metrics up-to-date
    intervalId = setInterval(fetchInsights, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
            {isLive && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
            Race Insights
          </h3>
          {data && (
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{data.raceName}</p>
          )}
        </div>
        {isLive && (
          <span className="text-[9px] font-mono uppercase bg-red-600/10 text-red-500 px-2 py-0.5 rounded-sm border border-red-600/20">
            Live Feed
          </span>
        )}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : !data ? (
          <div className="py-10 text-center text-slate-400 text-sm">Data unavailable</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                icon={Zap}
                label="Fastest Lap"
                value={data.fastestLapTime}
                sub={data.fastestLapDriver}
                accent
                delay={0.05}
              />
              
              {isLive ? (
                <StatCard
                  icon={Activity}
                  label="Track Status"
                  value={data.trackStatus}
                  sub={`Current Lap: ${data.currentLap}`}
                  delay={0.1}
                />
              ) : (
                <StatCard
                  icon={Clock}
                  label="Avg Pit Stop"
                  value={data.avgPitDuration}
                  sub={`${data.totalPitStops} total stops`}
                  delay={0.1}
                />
              )}

              <StatCard
                icon={GitBranch}
                label={isLive ? "Total Pitstops" : "Pit Stops"}
                value={data.totalPitStops}
                sub={isLive ? "accumulated stops" : "in last race"}
                delay={0.15}
              />
              <StatCard
                icon={PieChart}
                label="Top Compound"
                value={data.dominantCompound}
                sub={isLive ? "active compound" : "most used tire"}
                delay={0.2}
              />
            </div>

            {/* Tire usage bars */}
            {Object.keys(data.compoundCounts).length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                  {isLive ? "Live Compound Usage" : "Compound Usage"}
                </div>
                <div className="space-y-2">
                  {Object.entries(data.compoundCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([compound, count], i) => {
                      const total = Object.values(data.compoundCounts).reduce((s, v) => s + v, 0);
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={compound} className="flex items-center gap-3">
                          <span
                            className="text-[10px] font-bold font-mono w-8"
                            style={{ color: COMPOUND_COLORS[compound] || '#888' }}
                          >
                            {compound.slice(0, 4)}
                          </span>
                          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: COMPOUND_COLORS[compound] || '#888' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: i * 0.1 + 0.3, duration: 0.6, type: 'spring' }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                            {isLive ? `${count} cars (${pct}%)` : `${pct}%`}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RaceInsightsPanel;
