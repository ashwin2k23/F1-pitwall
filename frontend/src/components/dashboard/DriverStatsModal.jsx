import { motion } from 'framer-motion';
import { X, Trophy, Flag, Timer, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getDriverImage } from '../../utils/driverImages';

// Career stats keyed by driverId from Ergast API — photo is resolved separately via getDriverImage
const DRIVER_INTEL = {
  max_verstappen:  { number: 1,  age: 27, podiums: 112, championships: 4 },
  norris:          { number: 4,  age: 25, podiums: 22,  championships: 1 },
  leclerc:         { number: 16, age: 27, podiums: 38,  championships: 0 },
  sainz:           { number: 55, age: 30, podiums: 23,  championships: 0 },
  piastri:         { number: 81, age: 24, podiums: 10,  championships: 0 },
  russell:         { number: 63, age: 27, podiums: 16,  championships: 0 },
  hamilton:        { number: 44, age: 40, podiums: 202, championships: 7 },
  alonso:          { number: 14, age: 43, podiums: 106, championships: 2 },
  perez:           { number: 11, age: 35, podiums: 37,  championships: 0 },
  stroll:          { number: 18, age: 26, podiums: 3,   championships: 0 },
  gasly:           { number: 10, age: 28, podiums: 3,   championships: 0 },
  ocon:            { number: 31, age: 28, podiums: 2,   championships: 0 },
  albon:           { number: 23, age: 28, podiums: 0,   championships: 0 },
  tsunoda:         { number: 22, age: 25, podiums: 0,   championships: 0 },
  hulkenberg:      { number: 27, age: 37, podiums: 0,   championships: 0 },
  magnussen:       { number: 20, age: 32, podiums: 0,   championships: 0 },
  bottas:          { number: 77, age: 35, podiums: 67,  championships: 0 },
  zhou:            { number: 24, age: 25, podiums: 0,   championships: 0 },
  antonelli:       { number: 12, age: 18, podiums: 0,   championships: 0 },
  bearman:         { number: 87, age: 20, podiums: 0,   championships: 0 },
  colapinto:       { number: 43, age: 22, podiums: 0,   championships: 0 },
  lawson:          { number: 30, age: 22, podiums: 0,   championships: 0 },
  doohan:          { number: 7,  age: 22, podiums: 0,   championships: 0 },
  bortoleto:       { number: 5,  age: 20, podiums: 0,   championships: 0 },
  hadjar:          { number: 6,  age: 20, podiums: 0,   championships: 0 },
  default:         { number: '?', age: '—', podiums: '—', championships: '—' }
};

const DriverStatsModal = ({ driver, onClose }) => {
  const [liveStats, setLiveStats] = useState(null);
  
  const dId = driver.driverId;
  const intel = DRIVER_INTEL[dId] || DRIVER_INTEL.default;
  // Always resolve photo from the central image map using the driver's full name
  const photo = getDriverImage(driver.name);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`https://api.jolpi.ca/ergast/f1/current/drivers/${dId}/results.json`);
        // Calculate recent form (last 5 races)
        const races = res.data.MRData.RaceTable.Races.slice(-5);
        setLiveStats(races);
      } catch (err) {
        console.error('Failed to load driver recent stats', err);
      }
    };
    fetchStats();
  }, [dId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white dark:bg-[#0a0a0a] rounded-sm overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-slate-200 dark:border-white/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Profile Hero */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-end relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 h-[350px] md:h-[500px] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-[#0a0a0a]">
           
           {/* Abstract Background Numbers */}
           <div className="absolute inset-0 z-0">
             <div className="text-[180px] md:text-[240px] font-black font-serif italic text-slate-300 dark:text-white/5 absolute -top-16 -left-8 pointer-events-none select-none">
               {intel.number}
             </div>
           </div>

           {/* Transparent PNG Headshot */}
           <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center md:justify-end md:pr-8 pointer-events-none">
              <img src={photo} alt={driver.name} className="h-[300px] md:h-[450px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
           </div>

           {/* Bottom gradient to ensure text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-slate-100/40 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/40 dark:to-transparent z-20 pointer-events-none"></div>

           <div className="relative z-30 flex flex-col justify-end h-full mt-auto">
             <div className="text-[10px] text-red-600 font-mono tracking-widest uppercase font-bold mb-2 flex items-center gap-2 drop-shadow-md bg-white/50 dark:bg-black/50 w-max px-2 py-1 rounded backdrop-blur-sm">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
               {driver.team}
             </div>
             <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white leading-tight mb-2 drop-shadow-md">
               {driver.name}
             </h2>
             <div className="text-4xl md:text-6xl font-serif text-red-600 italic font-black drop-shadow-md">
               {intel.number}
             </div>
           </div>
        </div>

        {/* Right Side - Intelligence Data */}
        <div className="w-full md:w-1/2 p-8 bg-slate-50 dark:bg-[#050505] flex flex-col pt-12">
           <div className="flex justify-between items-center mb-8 border-b border-black/10 dark:border-white/10 pb-4">
             <h3 className="text-[10px] font-mono tracking-widest uppercase text-slate-500 font-bold">Career Intelligence</h3>
             <span className="text-xs font-mono font-bold text-red-600">SEASON: 2026</span>
           </div>

           <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-2">Total Points</div>
                <div className="font-serif font-bold text-4xl text-slate-900 dark:text-white flex items-baseline gap-2">
                  {driver.pts} <span className="text-xs text-red-600 tracking-widest font-mono">PTS</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-2 flex items-center gap-2"><Trophy className="w-3 h-3 text-yellow-500"/> Championships</div>
                <div className="font-serif font-bold text-4xl text-slate-900 dark:text-white">
                  {intel.championships}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-2 flex items-center gap-2"><Flag className="w-3 h-3"/> Podium Finishes</div>
                <div className="font-serif font-bold text-2xl text-slate-900 dark:text-gray-300">
                  {intel.podiums}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-2 flex items-center gap-2"><Timer className="w-3 h-3"/> Age</div>
                <div className="font-serif font-bold text-2xl text-slate-900 dark:text-gray-300">
                  {intel.age}
                </div>
              </div>
           </div>

           {/* Recent Form */}
           {liveStats && (
             <div className="mt-auto">
               <div className="text-[10px] pb-2 border-b border-black/10 dark:border-white/10 text-slate-400 font-mono tracking-widest uppercase mb-4 font-bold">Recent Form (Last 5 Rounds)</div>
               <div className="flex gap-2">
                 {liveStats.map((r, i) => {
                    const pos = parseInt(r.Results[0].position, 10);
                    let blockColor = 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white';
                    if (pos === 1) blockColor = 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50';
                    else if (pos <= 3) blockColor = 'bg-slate-300 dark:bg-white/30 text-slate-900 dark:text-white';
                    else if (pos <= 10) blockColor = 'bg-green-500/10 text-green-500 border border-green-500/30';
                    
                    return (
                      <div key={i} className={`flex-1 flex flex-col items-center justify-center p-2 rounded-sm ${blockColor}`}>
                        <span className="text-[8px] uppercase tracking-widest mb-1 opacity-70">{r.raceName.slice(0,3)}</span>
                        <span className="font-mono font-bold text-sm">P{pos}</span>
                      </div>
                    );
                 })}
               </div>
             </div>
           )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DriverStatsModal;
