// DriversPage.jsx — Grid of all 2026 drivers with stats, team colors, favorite toggle.
// New page at /drivers. Additive only — no existing code modified.

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Users } from 'lucide-react';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { getDriverImage } from '../utils/driverImages';
import { usePersonalization } from '../hooks/usePersonalization';
import f1Api from '../utils/f1Api';

const TEAM_HEX = {
  mclaren:      '#FF8700',
  ferrari:      '#E32219',
  mercedes:     '#00A19B',
  'red bull':   '#0600EF',
  'aston martin': '#006F62',
  alpine:       '#0090FF',
  williams:     '#005AFF',
  haas:         '#FFFFFF',
  sauber:       '#00E701',
  audi:         '#00E701',
  rb:           '#1638FA',
};

const getTeamHex = (teamName = '') => {
  const n = teamName.toLowerCase();
  for (const [key, hex] of Object.entries(TEAM_HEX)) {
    if (n.includes(key)) return hex;
  }
  return '#ef4444';
};

const DriverCard = ({ driver, isFav, onToggleFav, delay }) => {
  const color = getTeamHex(driver.team);
  const img = getDriverImage(driver.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-red-600/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default"
      id={`driver-card-${driver.driverId}`}
    >
      {/* Team color top stripe */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-5 flex flex-col h-full relative">
        {/* Position badge */}
        <div
          className="absolute top-4 left-4 text-4xl font-black italic leading-none"
          style={{ color: `${color}22` }}
        >
          {String(driver.pos).padStart(2, '0')}
        </div>

        {/* Fav button */}
        <button
          id={`fav-driver-${driver.driverId}`}
          onClick={() => onToggleFav(driver)}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all ${
            isFav
              ? 'text-red-500 bg-red-500/10'
              : 'text-slate-300 dark:text-slate-700 hover:text-red-400'
          }`}
          title={isFav ? 'Remove favourite' : 'Set as favourite driver'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
        </button>

        {/* Driver photo */}
        <div className="w-full h-36 flex items-end justify-center overflow-hidden mt-2 mb-4 relative">
          <img
            src={img}
            alt={driver.name}
            className="h-full object-cover object-top scale-110 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {/* Gradient fade bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#111] to-transparent" />
        </div>

        {/* Info */}
        <div className="mt-auto">
          <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-red-600 transition-colors">
            {driver.name.split(' ')[0]}
            <span className="block">{driver.name.split(' ').slice(1).join(' ')}</span>
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-widest mt-1"
            style={{ color }}
          >
            {driver.team}
          </div>
          <div className="flex items-baseline gap-1.5 mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">{driver.pts}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">PTS</span>
            <span className="ml-auto text-[10px] font-mono text-slate-400">{driver.wins} WIN{driver.wins !== '1' ? 'S' : ''}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { prefs, setFavoriteDriver, clearFavoriteDriver, isFavoriteDriver } = usePersonalization();

  useEffect(() => {
    f1Api.getDriverStandings('current')
      .then((json) => {
        const list = json.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        setDrivers(list.map((item) => ({
          pos: item.position,
          driverId: item.Driver.driverId,
          name: `${item.Driver.givenName} ${item.Driver.familyName}`,
          team: item.Constructors[0].name,
          pts: item.points,
          wins: item.wins,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.team.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggleFav = (driver) => {
    if (isFavoriteDriver(driver.driverId)) {
      clearFavoriteDriver();
    } else {
      setFavoriteDriver({ driverId: driver.driverId, name: driver.name, team: driver.team });
    }
  };

  return (
    <div className="pt-2 pb-20">
      {/* Header */}
      <div className="mb-8 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter leading-none">
              Driver <span className="text-red-600 font-bold italic">Grid.</span>
            </h1>
            <p className="mt-3 text-slate-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              2026 Season • {drivers.length} drivers
            </p>
          </div>

          {/* Favourite banner */}
          {prefs.favoriteDriver && (
            <div className="flex items-center gap-2 px-4 py-2 border border-red-600/30 bg-red-600/5 text-red-500">
              <Heart className="w-3.5 h-3.5 fill-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest">{prefs.favoriteDriver.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="drivers-search-input"
          type="text"
          placeholder="Search driver or team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} height="h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((driver, i) => (
            <DriverCard
              key={driver.driverId}
              driver={driver}
              isFav={isFavoriteDriver(driver.driverId)}
              onToggleFav={handleToggleFav}
              delay={i * 0.04}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-mono text-sm">
              No drivers match "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriversPage;
