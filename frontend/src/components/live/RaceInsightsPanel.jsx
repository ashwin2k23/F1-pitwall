// RaceInsightsPanel.jsx — Fastest lap, pit-stop counts, tire usage summary.
// New component — pulls from Ergast last race + OpenF1 live stints. Additive only.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, GitBranch, PieChart, Clock } from 'lucide-react';
import { StatCardSkeleton } from '../ui/SkeletonLoader';
import f1Api from '../../utils/f1Api';

const COMPOUND_COLORS = {
  SOFT: '#ef4444',
  MEDIUM: '#f59e0b',
  HARD: '#cbd5e1',
  INTERMEDIATE: '#22c55e',
  WET: '#3b82f6',
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

const RaceInsightsPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [resultsJson, pitJson, stintsJson] = await Promise.all([
          f1Api.getRaceResults('current', 'last'),
          f1Api.getPitStops('current', 'last'),
          f1Api.getLiveStints(),
        ]);

        // Fastest lap from results
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

        // Pit stops
        const pits = pitJson?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
        const totalPitStops = pits.length;
        const avgPitDuration =
          pits.length > 0
            ? (
                pits.reduce((sum, p) => sum + parseFloat(p.duration || 0), 0) / pits.length
              ).toFixed(2) + 's'
            : '—';

        // Tire usage from live stints (fallback to Ergast if no live session)
        const stints = stintsJson || [];
        const compoundCounts = {};
        stints.forEach((s) => {
          const c = (s.compound || 'UNKNOWN').toUpperCase();
          compoundCounts[c] = (compoundCounts[c] || 0) + 1;
        });
        const dominantCompound =
          stints.length > 0
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
      } catch (e) {
        console.error('[RaceInsightsPanel] fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
          Race Insights
        </h3>
        {data && (
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{data.raceName}</p>
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
              <StatCard
                icon={Clock}
                label="Avg Pit Stop"
                value={data.avgPitDuration}
                sub={`${data.totalPitStops} total stops`}
                delay={0.1}
              />
              <StatCard
                icon={GitBranch}
                label="Pit Stops"
                value={data.totalPitStops}
                sub="in last race"
                delay={0.15}
              />
              <StatCard
                icon={PieChart}
                label="Top Compound"
                value={data.dominantCompound}
                sub="most used tire"
                delay={0.2}
              />
            </div>

            {/* Tire usage bars */}
            {Object.keys(data.compoundCounts).length > 0 && (
              <div className="mt-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                  Compound Usage
                </div>
                <div className="space-y-2">
                  {Object.entries(data.compoundCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([compound, count], i) => {
                      const total = Object.values(data.compoundCounts).reduce((s, v) => s + v, 0);
                      const pct = Math.round((count / total) * 100);
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
                          <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{pct}%</span>
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
