import { motion } from 'framer-motion';
import { X, Trophy, Flag, Timer, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Static assets for immersion, keyed by lowercase driverId
const DRIVER_INTEL = {
  max_verstappen: {
    photo: 'https://images.unsplash.com/photo-1634568636412-a169b67ff9b9?q=80&w=2670&auto=format&fit=crop',
    number: 1, age: 26, podiums: 105, championships: 3, signature: 'MAX VERSTAPPEN'
  },
  norris: {
    photo: 'https://images.unsplash.com/photo-1541339907198-e08756bfed4f?q=80&w=2670&auto=format&fit=crop',
    number: 4, age: 24, podiums: 17, championships: 0, signature: 'LANDO NORRIS'
  },
  leclerc: {
    photo: 'https://images.unsplash.com/photo-1516496636080-14fb876b0521?q=80&w=2670&auto=format&fit=crop',
    number: 16, age: 26, podiums: 34, championships: 0, signature: 'CHARLES LECLERC'
  },
  sainz: {
    photo: 'https://images.unsplash.com/photo-1539037116277-4db20d58aa31?q=80&w=2670&auto=format&fit=crop',
    number: 55, age: 29, podiums: 21, championships: 0, signature: 'CARLOS SAINZ'
  },
  piastri: {
    photo: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2670&auto=format&fit=crop',
    number: 81, age: 23, podiums: 4, championships: 0, signature: 'OSCAR PIASTRI'
  },
  russell: {
    photo: 'https://images.unsplash.com/photo-1698246738927-463d1ed1d88a?q=80&w=2670&auto=format&fit=crop',
    number: 63, age: 26, podiums: 13, championships: 0, signature: 'GEORGE RUSSELL'
  },
  hamilton: {
    photo: 'https://images.unsplash.com/photo-1510461623351-41bd171fe798?q=80&w=2670&auto=format&fit=crop',
    number: 44, age: 39, podiums: 198, championships: 7, signature: 'LEWIS HAMILTON'
  },
  alonso: {
    photo: 'https://images.unsplash.com/photo-1563820245089-da65dff8d380?q=80&w=2670&auto=format&fit=crop',
    number: 14, age: 42, podiums: 106, championships: 2, signature: 'FERNANDO ALONSO'
  },
  default: {
    photo: 'https://images.unsplash.com/photo-1582260655060-e88102377488?q=80&w=2670&auto=format&fit=crop',
    number: 'TBD', age: 'TBD', podiums: 'TBD', championships: 'TBD', signature: 'DRIVER PROFILE'
  }
};

const DriverStatsModal = ({ driver, onClose }) => {
  const [liveStats, setLiveStats] = useState(null);
  
  const dId = driver.driverId;
  const intel = DRIVER_INTEL[dId] || DRIVER_INTEL.default;

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
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-end relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 h-64 md:h-[500px]">
           <div className="absolute inset-0 z-0">
              <img src={intel.photo} alt="Driver Profile Style" className="w-full h-full object-cover opacity-30 dark:opacity-[0.25] scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#050505] dark:via-[#050505]/60"></div>
           </div>

           <div className="relative z-10">
             <div className="text-[120px] font-black font-serif italic text-white opacity-5 absolute -top-32 -left-8 pointer-events-none select-none">
               {intel.number}
             </div>
             <div className="text-[10px] text-red-600 font-mono tracking-widest uppercase font-bold mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
               {driver.team}
             </div>
             <h2 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white leading-tight mb-2">
               {driver.name}
             </h2>
             <div className="text-4xl md:text-6xl font-serif text-red-600 italic font-black">
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
