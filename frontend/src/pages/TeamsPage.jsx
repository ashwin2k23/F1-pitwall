// TeamsPage.jsx — Constructor standings grid with team branding, driver roster, and favourite toggle.
// New page at /teams. Additive only — no existing code modified.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Search, Shield } from 'lucide-react';
import { CardSkeleton } from '../components/ui/SkeletonLoader';
import { usePersonalization } from '../hooks/usePersonalization';
import f1Api from '../utils/f1Api';

const TEAM_META = {
  mclaren:        { hex: '#FF8700', country: '🇬🇧', abbr: 'MCL' },
  ferrari:        { hex: '#E32219', country: '🇮🇹', abbr: 'FER' },
  mercedes:       { hex: '#00A19B', country: '🇩🇪', abbr: 'MER' },
  'red bull':     { hex: '#0600EF', country: '🇦🇹', abbr: 'RBR' },
  'aston martin': { hex: '#006F62', country: '🇬🇧', abbr: 'AMR' },
  alpine:         { hex: '#0090FF', country: '🇫🇷', abbr: 'ALP' },
  williams:       { hex: '#005AFF', country: '🇬🇧', abbr: 'WIL' },
  haas:           { hex: '#B6BABD', country: '🇺🇸', abbr: 'HAA' },
  sauber:         { hex: '#00E701', country: '🇨🇭', abbr: 'SAU' },
  audi:           { hex: '#00E701', country: '🇩🇪', abbr: 'AUD' },
  rb:             { hex: '#1638FA', country: '🇮🇹', abbr: 'RBF' },
};

const getTeamMeta = (teamName = '') => {
  const n = teamName.toLowerCase();
  for (const [key, meta] of Object.entries(TEAM_META)) {
    if (n.includes(key)) return meta;
  }
  return { hex: '#ef4444', country: '🏁', abbr: '???' };
};

const TeamCard = ({ team, drivers, isFav, onToggleFav, delay }) => {
  const meta = getTeamMeta(team.name);

  // Drivers for this team
  const teamDrivers = drivers.filter((d) =>
    d.team.toLowerCase().includes(team.name.toLowerCase().split(' ')[0])
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] hover:border-red-600/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      id={`team-card-${team.constructorId}`}
    >
      {/* Team colour stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: meta.hex }} />

      {/* Header */}
      <div className="p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-slate-400">{meta.country} {team.nationality}</span>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5 group-hover:text-red-600 transition-colors leading-tight">
              {team.name}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              id={`fav-team-${team.constructorId}`}
              onClick={() => onToggleFav(team)}
              className={`p-1.5 rounded-full transition-all ${
                isFav
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-slate-300 dark:text-slate-700 hover:text-red-400'
              }`}
              title={isFav ? 'Remove favourite' : 'Set as favourite team'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
            </button>
            <span
              className="text-3xl font-black italic opacity-20 leading-none"
              style={{ color: meta.hex }}
            >
              {meta.abbr}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 pt-4">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-black font-mono text-slate-900 dark:text-white">
            {team.pts}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PTS</span>
          <span className="ml-auto text-[10px] font-mono text-slate-400">{team.wins} WIN{team.wins !== '1' ? 'S' : ''}</span>
        </div>

        {/* Position bar */}
        <div className="mb-4">
          <div className="text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-widest">
            P{team.pos} Constructor
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: meta.hex }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (11 - parseInt(team.pos)) * 10)}%` }}
              transition={{ delay: delay + 0.3, duration: 0.6, type: 'spring' }}
            />
          </div>
        </div>

        {/* Driver roster */}
        {teamDrivers.length > 0 && (
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Drivers</div>
            <div className="flex flex-col gap-1">
              {teamDrivers.slice(0, 2).map((d) => (
                <div key={d.driverId} className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.hex }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const { prefs, setFavoriteTeam, clearFavoriteTeam, isFavoriteTeam } = usePersonalization();

  useEffect(() => {
    Promise.all([
      f1Api.getConstructorStandings('current'),
      f1Api.getDriverStandings('current'),
    ])
      .then(([teamsJson, driversJson]) => {
        const teamList = teamsJson.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
        const driverList = driversJson.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

        setTeams(teamList.map((item) => ({
          pos: item.position,
          constructorId: item.Constructor.constructorId,
          name: item.Constructor.name,
          nationality: item.Constructor.nationality,
          pts: item.points,
          wins: item.wins,
        })));

        setDrivers(driverList.map((item) => ({
          driverId: item.Driver.driverId,
          name: `${item.Driver.givenName} ${item.Driver.familyName}`,
          team: item.Constructors[0].name,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleToggleFav = (team) => {
    if (isFavoriteTeam(team.constructorId)) {
      clearFavoriteTeam();
    } else {
      setFavoriteTeam({ constructorId: team.constructorId, name: team.name });
    }
  };

  return (
    <div className="pt-2 pb-20">
      {/* Header */}
      <div className="mb-8 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter leading-none">
              Constructor <span className="text-red-600 font-bold italic">Cup.</span>
            </h1>
            <p className="mt-3 text-slate-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              2026 Season • {teams.length} constructors
            </p>
          </div>

          {/* Favourite banner */}
          {prefs.favoriteTeam && (
            <div className="flex items-center gap-2 px-4 py-2 border border-red-600/30 bg-red-600/5 text-red-500">
              <Heart className="w-3.5 h-3.5 fill-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest">{prefs.favoriteTeam.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="teams-search-input"
          type="text"
          placeholder="Search team…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} height="h-60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((team, i) => (
            <TeamCard
              key={team.constructorId}
              team={team}
              drivers={drivers}
              isFav={isFavoriteTeam(team.constructorId)}
              onToggleFav={handleToggleFav}
              delay={i * 0.05}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-mono text-sm">
              No teams match "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
