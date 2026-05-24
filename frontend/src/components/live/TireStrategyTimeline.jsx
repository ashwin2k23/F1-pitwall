// TireStrategyTimeline.jsx — Horizontal stint visualization per driver.
// New component — reads from OpenF1 stints API. Does NOT touch existing components.

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimelineSkeleton } from '../ui/SkeletonLoader';
import f1Api from '../../utils/f1Api';


const COMPOUND_COLORS = {
  SOFT: { bg: '#ef4444', label: 'S', text: '#fff' },
  MEDIUM: { bg: '#f59e0b', label: 'M', text: '#111' },
  HARD: { bg: '#cbd5e1', label: 'H', text: '#111' },
  INTERMEDIATE: { bg: '#22c55e', label: 'I', text: '#fff' },
  WET: { bg: '#3b82f6', label: 'W', text: '#fff' },
  UNKNOWN: { bg: '#475569', label: '?', text: '#fff' },
};

const getCompound = (c) => COMPOUND_COLORS[(c || '').toUpperCase()] || COMPOUND_COLORS.UNKNOWN;

const TireStrategyTimeline = ({ totalLaps = 57 }) => {
  const [driverStints, setDriverStints] = useState([]); // [{ acronym, teamColor, stints: [{compound, lapStart, lapEnd}] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isLastRace, setIsLastRace] = useState(false);

  const TEAM_COLORS = {
    'mercedes': '#00D2BE', 'red_bull': '#3671C6', 'ferrari': '#E8002D',
    'mclaren': '#FF8000', 'alpine': '#FF87BC', 'aston_martin': '#229971',
    'williams': '#64C4FF', 'rb': '#6692FF', 'kick_sauber': '#52E252', 'haas': '#B6BABD',
  };

  // Fallback: reconstruct stints from Ergast last race pit stops
  const fetchLastRaceFallback = useCallback(async () => {
    try {
      const [resultsJson, pitJson] = await Promise.all([
        f1Api.getRaceResults('current', 'last'),
        f1Api.getPitStops('current', 'last'),
      ]);
      const results = resultsJson?.MRData?.RaceTable?.Races?.[0]?.Results || [];
      const pits = pitJson?.MRData?.RaceTable?.Races?.[0]?.PitStops || [];
      const laps = parseInt(results[0]?.laps || totalLaps);

      // Group pit stops by driverId
      const pitsByDriver = {};
      pits.forEach((p) => {
        if (!pitsByDriver[p.driverId]) pitsByDriver[p.driverId] = [];
        pitsByDriver[p.driverId].push(parseInt(p.lap));
      });

      // Build driver lookup from results
      const rows = results.slice(0, 15).map((r) => {
        const driverId = r.Driver.driverId;
        const pitLaps = (pitsByDriver[driverId] || []).sort((a, b) => a - b);
        const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD'];

        // Build stints from pit lap boundaries
        const boundaries = [1, ...pitLaps, laps];
        const stints = boundaries.slice(0, -1).map((start, i) => ({
          compound: COMPOUNDS[i % COMPOUNDS.length],
          lapStart: start,
          lapEnd: boundaries[i + 1] - (i < boundaries.length - 2 ? 1 : 0),
        }));

        return {
          driverNumber: r.number,
          acronym: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
          teamColor: TEAM_COLORS[r.Constructor.constructorId] || '#ef4444',
          stints,
        };
      });

      if (rows.length > 0) {
        setDriverStints(rows);
        setIsLastRace(true);
        setError(null);
      }
    } catch (e) {
      console.error('[TireStrategyTimeline] fallback error:', e);
      setError('fetch-error');
    } finally {
      setLoading(false);
    }
  }, [totalLaps]);

  const fetchStints = useCallback(async () => {
    try {
      const [stintsData, driversData] = await Promise.all([
        f1Api.getLiveStints(),
        f1Api.getLiveDrivers(),
      ]);

      const driverMap = {};
      (driversData || []).forEach((d) => {
        driverMap[d.driver_number] = d;
      });

      const byDriver = {};
      (stintsData || []).forEach((s) => {
        if (!byDriver[s.driver_number]) byDriver[s.driver_number] = [];
        byDriver[s.driver_number].push(s);
      });

      const rows = Object.entries(byDriver).map(([driverNum, stints]) => {
        const driver = driverMap[driverNum] || {};
        const sortedStints = [...stints].sort((a, b) => a.stint_number - b.stint_number);
        return {
          driverNumber: driverNum,
          acronym: driver.name_acronym || `#${driverNum}`,
          teamColor: driver.team_colour ? `#${driver.team_colour}` : '#ef4444',
          stints: sortedStints.map((s) => ({
            compound: s.compound || 'UNKNOWN',
            lapStart: s.lap_start || 1,
            lapEnd: s.lap_end || totalLaps,
          })),
        };
      });

      if (rows.length > 0) {
        setDriverStints(rows);
        setIsLastRace(false);
        setError(null);
      } else {
        await fetchLastRaceFallback();
      }
    } catch (e) {
      console.error('[TireStrategyTimeline] live fetch error, trying fallback:', e);
      await fetchLastRaceFallback();
    } finally {
      setLoading(false);
    }
  }, [totalLaps, fetchLastRaceFallback]);

  useEffect(() => {
    fetchStints();
    const timer = setInterval(fetchStints, 30000);
    return () => clearInterval(timer);
  }, [fetchStints]);

  if (loading) return <TimelineSkeleton rows={8} />;

  if (error) {
    return (
      <div className="py-10 text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Could not load tire data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" id="tire-strategy-timeline">
      {isLastRace && (
        <div className="mb-3 px-1 py-1.5 bg-slate-100 dark:bg-slate-800/60 text-[10px] font-mono text-slate-400 uppercase tracking-widest text-center rounded">
          📋 Last Race Strategy — Live session inactive
        </div>
      )}
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(COMPOUND_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([compound, style]) => (
          <div key={compound} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-sm text-[8px] font-black flex items-center justify-center"
              style={{ backgroundColor: style.bg, color: style.text }}
            >
              {style.label}
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{compound}</span>
          </div>
        ))}
      </div>

      {/* Axis */}
      <div className="flex items-center gap-2 mb-1 pl-14">
        {[1, Math.round(totalLaps * 0.25), Math.round(totalLaps * 0.5), Math.round(totalLaps * 0.75), totalLaps].map((lap) => (
          <div
            key={lap}
            className="text-[9px] font-mono text-slate-400"
            style={{ position: 'absolute', left: `calc(3.5rem + ${((lap - 1) / (totalLaps - 1)) * 100}% * (100% - 3.5rem) / 100%)` }}
          >
            {lap}
          </div>
        ))}
      </div>

      {/* Driver rows */}
      {driverStints.map((row, rowIdx) => (
        <motion.div
          key={row.driverNumber}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rowIdx * 0.04, duration: 0.35 }}
          className="flex items-center gap-3 group"
          id={`tire-row-${row.acronym.toLowerCase()}`}
        >
          {/* Driver label */}
          <div className="flex items-center gap-1.5 w-12 flex-shrink-0">
            <div
              className="w-1 h-4 rounded-full"
              style={{ backgroundColor: row.teamColor }}
            />
            <span className="text-xs font-bold font-mono text-slate-700 dark:text-white truncate">
              {row.acronym}
            </span>
          </div>

          {/* Timeline bar */}
          <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-900 relative rounded-sm overflow-hidden">
            {row.stints.map((stint, sIdx) => {
              const start = ((stint.lapStart - 1) / totalLaps) * 100;
              const width = ((stint.lapEnd - stint.lapStart + 1) / totalLaps) * 100;
              const style = getCompound(stint.compound);
              return (
                <motion.div
                  key={sIdx}
                  title={`${stint.compound} | Laps ${stint.lapStart}–${stint.lapEnd}`}
                  className="absolute top-0 h-full flex items-center justify-center"
                  style={{
                    left: `${start}%`,
                    width: `${width}%`,
                    backgroundColor: style.bg,
                  }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: rowIdx * 0.04 + sIdx * 0.08, duration: 0.5, type: 'spring', bounce: 0.2 }}
                >
                  {width > 5 && (
                    <span
                      className="text-[9px] font-black select-none"
                      style={{ color: style.text }}
                    >
                      {style.label}
                    </span>
                  )}
                  {/* Stint divider */}
                  {sIdx > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-black/20" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Lap axis labels */}
      <div className="flex pl-14 text-[9px] font-mono text-slate-400 pt-1">
        <span>LAP 1</span>
        <span className="ml-auto">LAP {totalLaps}</span>
      </div>
    </div>
  );
};

export default TireStrategyTimeline;
