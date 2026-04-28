// DriverInsightModal.jsx — Detailed driver panel triggered from LiveTimingBoard clicks.
// New component — additive only, zero existing code changed.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, GitBranch, TrendingUp, Circle } from 'lucide-react';
import { getDriverImage } from '../../utils/driverImages';
import f1Api from '../../utils/f1Api';

const TIRE_COLORS = {
  SOFT: '#ef4444', MEDIUM: '#f59e0b', HARD: '#cbd5e1',
  INTERMEDIATE: '#22c55e', WET: '#3b82f6', UNKNOWN: '#64748b',
};
const TIRE_LABELS = { SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W', UNKNOWN: '?' };

const positionSuffix = (n) => {
  const p = parseInt(n);
  if (p === 1) return '1st'; if (p === 2) return '2nd'; if (p === 3) return '3rd';
  return `${p}th`;
};

const formatGap = (gap) => {
  if (gap === 0 || gap === null) return 'LEADER';
  if (typeof gap === 'string') return gap;
  return `+${Number(gap).toFixed(3)}s`;
};

// Find driver in Ergast standings by matching acronym or full name
const findInStandings = (standings, driver) => {
  const { acronym = '', fullName = '' } = driver;
  const lastName = fullName.split(' ').pop()?.toLowerCase() || '';
  const acronymLower = acronym.toLowerCase();
  return standings.find((s) => {
    const sName = `${s.Driver.givenName} ${s.Driver.familyName}`.toLowerCase();
    const sFam = s.Driver.familyName.toLowerCase();
    return (
      sName.includes(lastName) ||
      sFam.includes(lastName) ||
      sName.includes(acronymLower) ||
      (lastName.length > 2 && sFam.startsWith(lastName.slice(0, 4)))
    );
  });
};

const DriverInsightModal = ({ driver, onClose }) => {
  const [standings, setStandings] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const compound = (driver.compound || 'UNKNOWN').toUpperCase();
  const tireColor = TIRE_COLORS[compound] || TIRE_COLORS.UNKNOWN;
  const tireLabel = TIRE_LABELS[compound] || '?';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dsJson, raceJson] = await Promise.all([
          f1Api.getDriverStandings('current'),
          f1Api.getRaceResults('current', 'last'),
        ]);

        const driverList =
          dsJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        const match = findInStandings(driverList, driver);
        if (match) setStandings(match);

        const allResults =
          raceJson?.MRData?.RaceTable?.Races?.[0]?.Results || [];
        const driverResult = allResults.find((r) => {
          const fullN = `${r.Driver.givenName} ${r.Driver.familyName}`.toLowerCase();
          return fullN.includes(driver.fullName?.split(' ').pop()?.toLowerCase() || '___');
        });
        if (driverResult) setResults([driverResult]);
      } catch (e) {
        console.error('[DriverInsightModal]', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [driver]);

  const driverImg = getDriverImage(driver.fullName || driver.acronym || '');
  const pts = standings?.points || '—';
  const champPos = standings?.position || '—';
  const wins = standings?.wins || '0';
  const lastRaceResult = results[0];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Panel */}
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', bounce: 0.25, duration: 0.45 }}
          className="relative w-full max-w-lg bg-[#0c0c0c] border border-slate-800 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Team colour top stripe */}
          <div className="h-1.5 w-full" style={{ backgroundColor: driver.teamColor }} />

          {/* Close button */}
          <button
            id="driver-insight-close"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-400 transition-colors rounded-sm"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Hero: photo + identity */}
          <div className="relative flex items-end gap-6 px-6 pt-6 pb-0 overflow-hidden">
            {/* Background number watermark */}
            <div
              className="absolute right-6 top-0 text-[120px] font-black italic leading-none opacity-[0.06] select-none"
              style={{ color: driver.teamColor }}
            >
              {driver.driverNumber}
            </div>

            {/* Driver photo */}
            <div className="relative w-28 h-36 flex-shrink-0 overflow-hidden">
              <img
                src={driverImg}
                alt={driver.fullName}
                className="w-full h-full object-cover object-top"
                onError={(e) => { e.target.style.opacity = '0'; }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0c0c0c] to-transparent" />
            </div>

            {/* Name + team */}
            <div className="pb-4 relative z-10">
              <div
                className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1"
                style={{ color: driver.teamColor }}
              >
                {driver.teamName}
              </div>
              <div className="text-4xl font-black italic tracking-tighter text-white leading-none">
                {driver.fullName?.split(' ')[0] || driver.acronym}
              </div>
              <div className="text-4xl font-black italic tracking-tighter leading-none" style={{ color: driver.teamColor }}>
                {driver.fullName?.split(' ').slice(1).join(' ') || ''}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  #{driver.driverNumber}
                </span>
                {/* Tire badge inline */}
                <span
                  className="w-5 h-5 rounded-full border-2 text-[9px] font-black flex items-center justify-center"
                  style={{ borderColor: tireColor, color: compound === 'HARD' ? '#111' : tireColor, backgroundColor: compound === 'HARD' ? '#e2e8f0' : 'transparent' }}
                >
                  {tireLabel}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{compound}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-slate-800 mt-2" />

          {/* Live race stats row */}
          <div className="grid grid-cols-3 divide-x divide-slate-800 mx-6 my-4">
            {[
              { label: 'Current Gap', value: formatGap(driver.gap), accent: driver.gap === 0 },
              { label: 'Pit Stops', value: driver.pitCount ?? '—', accent: false },
              { label: 'Tire', value: `${compound.slice(0, 4)}`, accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className="px-4 py-2 first:pl-0 last:pr-0">
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">{label}</div>
                <div className={`text-xl font-black font-mono ${accent ? 'text-red-500' : 'text-white'}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Season championship stats */}
          <div className="mx-6 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
              <Trophy className="w-3 h-3" /> 2026 Championship
            </div>
            {loading ? (
              <div className="h-16 bg-slate-900 animate-pulse rounded" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Position', value: champPos !== '—' ? positionSuffix(champPos) : '—', icon: TrendingUp },
                  { label: 'Points', value: pts, icon: Zap },
                  { label: 'Wins', value: wins, icon: Trophy },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="bg-slate-900/80 border border-slate-800 p-3 text-center"
                  >
                    <Icon className="w-3.5 h-3.5 text-red-500 mx-auto mb-1" />
                    <div className="text-lg font-black font-mono text-white">{value}</div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last race result */}
          {!loading && lastRaceResult && (
            <div className="mx-6 mb-5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <GitBranch className="w-3 h-3" /> Last Race Result
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-4 py-3">
                <div>
                  <div className="text-white font-bold text-sm">P{lastRaceResult.position}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {lastRaceResult.status}
                  </div>
                </div>
                {lastRaceResult.FastestLap?.rank === '1' && (
                  <div className="flex items-center gap-1.5 text-purple-400 border border-purple-400/30 bg-purple-400/10 px-2 py-1">
                    <Zap className="w-3 h-3 fill-purple-400" />
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Fastest Lap</span>
                    <span className="text-[9px] font-mono">{lastRaceResult.FastestLap.Time?.time}</span>
                  </div>
                )}
                <div className="text-right">
                  <div className="text-white font-bold font-mono">{lastRaceResult.points} pts</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {lastRaceResult.laps} laps
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No data fallback */}
          {!loading && !standings && (
            <div className="mx-6 mb-5 py-4 text-center border border-slate-800">
              <Circle className="w-4 h-4 text-slate-600 mx-auto mb-1" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Season data not yet available
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DriverInsightModal;
