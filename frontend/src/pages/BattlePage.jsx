import { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getDriverImage } from '../utils/driverImages';
import { Trophy, FastForward, Shield, Target, Activity } from 'lucide-react';

// Simulated detailed stats for radar chart (Ergast doesn't provide these)
const getDriverStats = (driverId) => {
  const base = {
    qualifying: 85 + Math.random() * 10,
    raceCraft: 80 + Math.random() * 15,
    tireManagement: 75 + Math.random() * 20,
    overtakes: 70 + Math.random() * 25,
    consistency: 85 + Math.random() * 10
  };
  
  if (['max_verstappen', 'leclerc', 'norris', 'hamilton', 'alonso'].includes(driverId)) {
     base.qualifying += 5;
     base.raceCraft += 5;
  }
  
  return base;
};

const getTeamColors = (teamName) => {
  if (!teamName) return 'bg-gradient-to-br from-slate-700 to-slate-900 text-white';
  const name = teamName.toLowerCase();
  if (name.includes('mclaren')) return 'bg-gradient-to-br from-[#FF8700] to-[#E55B00] text-white';
  if (name.includes('ferrari')) return 'bg-gradient-to-br from-[#E32219] to-[#8C0000] text-white';
  if (name.includes('mercedes')) return 'bg-gradient-to-br from-[#00A19B] to-[#00706B] text-white';
  if (name.includes('red bull')) return 'bg-gradient-to-br from-[#0600EF] to-[#000050] text-white';
  if (name.includes('aston')) return 'bg-gradient-to-br from-[#006F62] to-[#004035] text-white';
  if (name.includes('alpine')) return 'bg-gradient-to-br from-[#0090FF] to-[#0050FF] text-white';
  if (name.includes('williams')) return 'bg-gradient-to-br from-[#005AFF] to-[#002050] text-white';
  if (name.includes('haas')) return 'bg-gradient-to-br from-[#FFFFFF] to-[#E0E0E0] text-black';
  if (name.includes('sauber') || name.includes('audi')) return 'bg-gradient-to-br from-[#00E701] to-[#00A000] text-black';
  if (name.includes('rb')) return 'bg-gradient-to-br from-[#1638FA] to-[#0A1A80] text-white';
  return 'bg-gradient-to-br from-slate-700 to-slate-900 text-white';
};

const BattlePage = () => {
  const [drivers, setDrivers] = useState([]);
  const [driver1, setDriver1] = useState(null);
  const [driver2, setDriver2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await axios.get('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        const standings = res.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        
        const mapped = standings.map(item => ({
          id: item.Driver.driverId,
          name: `${item.Driver.givenName} ${item.Driver.familyName}`,
          team: item.Constructors[0].name,
          pts: parseInt(item.points),
          wins: parseInt(item.wins),
          stats: getDriverStats(item.Driver.driverId)
        }));
        
        setDrivers(mapped);
        setDriver1(mapped[0]); // Default to P1
        setDriver2(mapped[1]); // Default to P2
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  if (loading) return <div className="py-20 text-center font-mono text-slate-500 animate-pulse">Loading Telemetry...</div>;

  const radarData = [
    { subject: 'Qualifying Pace', A: driver1?.stats.qualifying, B: driver2?.stats.qualifying, fullMark: 100 },
    { subject: 'Race Craft', A: driver1?.stats.raceCraft, B: driver2?.stats.raceCraft, fullMark: 100 },
    { subject: 'Tire Mgmt', A: driver1?.stats.tireManagement, B: driver2?.stats.tireManagement, fullMark: 100 },
    { subject: 'Overtaking', A: driver1?.stats.overtakes, B: driver2?.stats.overtakes, fullMark: 100 },
    { subject: 'Consistency', A: driver1?.stats.consistency, B: driver2?.stats.consistency, fullMark: 100 },
  ];

  // Mock progression data
  const progressionData = Array.from({length: 10}).map((_, i) => ({
    race: `R${i+1}`,
    [driver1?.name]: Math.floor(Math.random() * 25 * (i+1)),
    [driver2?.name]: Math.floor(Math.random() * 25 * (i+1)),
  }));

  return (
    <div className="pt-2 pb-20">
      <div className="mb-12 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white capitalize tracking-tighter">
          Battle <span className="text-red-600 font-bold italic">Mode.</span>
        </h1>
        <p className="text-slate-500 font-mono tracking-widest uppercase mt-4 text-sm">Head-to-head telemetry analysis</p>
      </div>

      {/* Driver Selection & Portraits */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 relative">
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-serif font-bold text-slate-200 dark:text-white/5 italic z-0 pointer-events-none">VS</div>
         
         {/* Driver 1 */}
         <div className="w-full md:w-5/12 relative z-10 flex flex-col">
             <select 
               value={driver1?.id} 
               onChange={e => setDriver1(drivers.find(d => d.id === e.target.value))}
               className="bg-black/60 border border-slate-800 text-lg font-mono font-bold text-white mb-6 p-2 rounded outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 self-center md:self-start w-full max-w-[280px]"
             >
               {drivers.map(d => <option key={d.id} value={d.id} className="text-base text-black bg-white">{d.name}</option>)}
             </select>
            
            {driver1 && (
              <div 
                className={`relative rounded-xl overflow-hidden shadow-2xl w-full h-[320px] transition-transform ${getTeamColors(driver1.team)}`}
              >
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px'}}></div>
                <div className="p-5 flex flex-col h-full relative z-10 justify-between">
                  <div>
                    <div className="text-lg font-bold opacity-90 drop-shadow-md leading-tight">{driver1.name.split(' ')[0]}</div>
                    <div className="text-3xl font-black leading-none drop-shadow-md">{driver1.name.split(' ').slice(1).join(' ')}</div>
                    <div className="text-xs mt-2 opacity-90 font-bold drop-shadow-md">{driver1.team}</div>
                  </div>
                  <div className="flex items-end justify-between">
                     <div className="flex items-baseline gap-1 drop-shadow-md">
                        <span className="text-4xl font-black">{driver1.pts}</span>
                        <span className="text-xs font-bold uppercase">PTS</span>
                     </div>
                     <div className="flex items-baseline gap-1 drop-shadow-md text-right">
                        <span className="text-4xl font-black">{driver1.wins}</span>
                        <span className="text-xs font-bold uppercase">WINS</span>
                     </div>
                  </div>
                </div>
                <img src={getDriverImage(driver1.name)} className="absolute bottom-0 right-[-10%] h-[90%] object-contain object-bottom z-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" alt={driver1.name} />
              </div>
            )}
         </div>

         {/* Driver 2 */}
         <div className="w-full md:w-5/12 relative z-10 flex flex-col">
             <select 
               value={driver2?.id} 
               onChange={e => setDriver2(drivers.find(d => d.id === e.target.value))}
               className="bg-black/60 border border-slate-800 text-lg font-mono font-bold text-white mb-6 p-2 rounded outline-none focus:border-red-650 focus:ring-1 focus:ring-red-650 self-center md:self-end w-full max-w-[280px]"
               dir="rtl"
             >
               {drivers.map(d => <option key={d.id} value={d.id} className="text-base text-black bg-white" dir="ltr">{d.name}</option>)}
             </select>
            
            {driver2 && (
              <div 
                className={`relative rounded-xl overflow-hidden shadow-2xl w-full h-[320px] transition-transform ${getTeamColors(driver2.team)}`}
              >
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px'}}></div>
                <div className="p-5 flex flex-col h-full relative z-10 justify-between">
                  <div className="text-right">
                    <div className="text-lg font-bold opacity-90 drop-shadow-md leading-tight">{driver2.name.split(' ')[0]}</div>
                    <div className="text-3xl font-black leading-none drop-shadow-md">{driver2.name.split(' ').slice(1).join(' ')}</div>
                    <div className="text-xs mt-2 opacity-90 font-bold drop-shadow-md">{driver2.team}</div>
                  </div>
                  <div className="flex items-end justify-between flex-row-reverse">
                     <div className="flex items-baseline gap-1 drop-shadow-md">
                        <span className="text-4xl font-black">{driver2.pts}</span>
                        <span className="text-xs font-bold uppercase">PTS</span>
                     </div>
                     <div className="flex items-baseline gap-1 drop-shadow-md text-left">
                        <span className="text-4xl font-black">{driver2.wins}</span>
                        <span className="text-xs font-bold uppercase">WINS</span>
                     </div>
                  </div>
                </div>
                <img src={getDriverImage(driver2.name)} className="absolute bottom-0 left-[-10%] h-[90%] object-contain object-bottom z-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform scale-x-[-1]" alt={driver2.name} />
              </div>
            )}
         </div>
      </div>

      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
         <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight mb-8">Performance <span className="text-red-600 italic">Radar</span></h3>
             <div className="glass-panel h-[400px] flex items-center justify-center p-4">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                   <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase' }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar name={driver1?.name} dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.4} />
                   <Radar name={driver2?.name} dataKey="B" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                   <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff', fontFamily: 'monospace' }} />
                 </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Progression Graph */}
         <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight mb-8">Championship <span className="text-red-600 italic">Progression</span></h3>
             <div className="glass-panel h-[400px] p-6">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={progressionData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="race" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} dy={10} />
                   <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} dx={-10} />
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}
                      itemStyle={{ fontFamily: 'serif', fontWeight: 'bold' }}
                   />
                   <Line type="monotone" dataKey={driver1?.name} stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} activeDot={{ r: 6 }} />
                   <Line type="monotone" dataKey={driver2?.name} stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BattlePage;
