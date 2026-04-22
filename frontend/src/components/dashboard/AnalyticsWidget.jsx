import { useState, useEffect, useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const AnalyticsWidget = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const driverMap = {
    'Max Verstappen': 'max_verstappen',
    'Lando Norris': 'norris',
    'Charles Leclerc': 'leclerc',
    'Lewis Hamilton': 'hamilton',
    'Oscar Piastri': 'piastri',
    'Carlos Sainz': 'sainz',
    'George Russell': 'russell',
    'Fernando Alonso': 'alonso'
  };

  const driverName = user?.favoriteDriver || 'Lando Norris';
  const driverQuery = driverMap[driverName] || 'norris';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`https://api.jolpi.ca/ergast/f1/current/drivers/${driverQuery}/results.json`);
        let cumulative = 0;
        const races = res.data.MRData.RaceTable.Races;
        const mapped = races.map(race => {
           cumulative += parseInt(race.Results[0].points, 10);
           return {
               race: race.raceName.replace('Grand Prix', '').trim(),
               abbrev: race.raceName.slice(0, 3).toUpperCase(),
               points: cumulative,
               position: race.Results[0].position,
               racePoints: race.Results[0].points
           };
        });
        setData(mapped);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [driverQuery]);

  const currentPoints = data.length > 0 ? data[data.length - 1].points : 0;
  const racesCompleted = data.length;
  const avgPoints = racesCompleted > 0 ? (currentPoints / racesCompleted).toFixed(1) : 0;

  if (loading) {
     return <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">Compiling Telemetry...</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const raceData = payload[0].payload;
      return (
        <div className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-md border border-slate-700/50 dark:border-white/10 p-3 rounded-md shadow-xl">
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1">{raceData.race}</p>
          <p className="text-sm font-bold text-white font-mono tracking-wide mb-1">
            <span className="text-red-500 text-[10px] mr-2">POS</span> P{raceData.position}
          </p>
          <div className="flex gap-4 items-center">
             <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-widest">Race Pts</span>
                <span className="text-xs text-slate-300 font-mono font-bold">+{raceData.racePoints}</span>
             </div>
             <div>
                <span className="text-[9px] text-slate-500 block uppercase tracking-widest">Total</span>
                <span className="text-xs text-white font-mono font-bold">{raceData.points}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col p-4 bg-white dark:bg-[#0a0a0a] rounded-sm">
      {/* Information Header */}
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-4 mb-2">
         <div>
            <div className="text-[9px] text-red-600 font-mono tracking-widest uppercase font-bold mb-1 flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
               Championship Trajectory
            </div>
            <h4 className="text-lg md:text-xl font-serif font-bold text-slate-900 dark:text-white capitalize leading-none">
              {driverName}
            </h4>
         </div>
         <div className="flex gap-4 md:gap-8">
            <div className="text-right">
               <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-1">Total Pts</div>
               <div className="text-lg md:text-2xl font-bold font-mono text-slate-900 dark:text-white leading-none tracking-tighter">
                  {currentPoints}
               </div>
            </div>
            <div className="text-right">
               <div className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mb-1">Avg / Race</div>
               <div className="text-lg md:text-2xl font-bold font-mono text-slate-900 dark:text-white leading-none tracking-tighter">
                  {avgPoints}
               </div>
            </div>
         </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-0 w-full relative">
        <div className="absolute inset-x-0 bottom-6 h-px bg-slate-200 dark:bg-white/5 z-0"></div>
        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: -10 }}>
            <defs>
              <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="abbrev" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dy={5} />
            <Tooltip cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} content={<CustomTooltip />} />
            <Area type="monotone" dataKey="points" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
