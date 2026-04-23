import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DriverStatsModal from './DriverStatsModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const StandingsWidget = ({ mode = 'drivers' }) => {
  const [drivers, setDrivers] = useState([]);
  const [constructors, setConstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const [driversRes, constructorsRes] = await Promise.all([
          axios.get('https://api.jolpi.ca/ergast/f1/current/driverStandings.json'),
          axios.get('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json')
        ]);
        
        const driverStandings = driversRes.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        const constructorStandings = constructorsRes.data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
        
        const mappedDrivers = driverStandings.map((item) => {
           let color = '!border-l-blue-600';
           const teamName = item.Constructors[0].name.toLowerCase();
           if (teamName.includes('mclaren')) color = '!border-l-orange-500';
           if (teamName.includes('ferrari')) color = '!border-l-red-600';
           if (teamName.includes('mercedes')) color = '!border-l-teal-400';
           if (teamName.includes('aston')) color = '!border-l-green-600';

           return {
             pos: item.position,
             name: `${item.Driver.givenName} ${item.Driver.familyName}`,
             driverId: item.Driver.driverId,
             team: item.Constructors[0].name,
             pts: item.points,
             wins: item.wins,
             color
           }
        });

        const mappedConstructors = constructorStandings.map((item) => {
           let color = '!border-l-blue-600';
           const teamName = item.Constructor.name.toLowerCase();
           if (teamName.includes('mclaren')) color = '!border-l-orange-500';
           if (teamName.includes('ferrari')) color = '!border-l-red-600';
           if (teamName.includes('mercedes')) color = '!border-l-teal-400';
           if (teamName.includes('aston')) color = '!border-l-green-600';

           return {
             pos: item.position,
             name: item.Constructor.name,
             constructorId: item.Constructor.constructorId,
             team: item.Constructor.nationality,
             pts: item.points,
             wins: item.wins,
             color
           }
        });

        setDrivers(mappedDrivers);
        setConstructors(mappedConstructors);
      } catch (err) {
        console.error('Failed to fetch real standings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  const currentData = mode === 'drivers' ? drivers : constructors;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentItems = currentData.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  useEffect(() => {
    setCurrentPage(0);
  }, [mode]);

  return (
    <div className="h-full flex flex-col relative justify-between overflow-hidden">
      <div className="flex-1 overflow-auto pr-2 mt-4 scrollbar-hide relative">
        {loading ? (
           <div className="text-slate-500 dark:text-gray-400 text-sm animate-pulse">Loading live telemetry...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={mode + currentPage}
              initial={{ opacity: 0, rotateX: -90, transformOrigin: 'top' }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 90 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
              className="space-y-3"
            >
              {currentItems.map((item) => (
                <div 
                  key={item.pos}
                  onClick={() => mode === 'drivers' ? setSelectedDriver(item) : null}
                  className={`flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10 ${item.color.replace('border-l-4', 'border-l-2')} hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${mode === 'drivers' ? 'cursor-pointer group' : 'group'}`}
                >
                  <div className="flex items-center gap-4 pl-3">
                    <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500 w-4 font-bold group-hover:text-red-500 transition-colors">{String(item.pos).padStart(2, '0')}</span>
                    <div>
                      <div className="font-serif font-bold tracking-tight text-slate-900 dark:text-white text-base leading-tight group-hover:text-red-600 transition-colors">{item.name}</div>
                      <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-gray-500">{item.team}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pr-3">
                     <div className="font-mono font-bold text-lg text-slate-900 dark:text-white group-hover:text-red-500 transition-colors">
                       {item.pts}
                     </div>
                     <div className="text-[9px] text-red-500 font-bold tracking-widest hidden sm:block">PTS</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {!loading && currentData.length > 0 && (
         <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200 dark:border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
               Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
               <button 
                 onClick={prevPage}
                 className="p-1 px-3 border border-slate-300 dark:border-white/20 hover:border-red-600 dark:hover:border-red-600 hover:text-red-600 transition-colors flex items-center justify-center rounded-sm text-slate-900 dark:text-white"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button 
                 onClick={nextPage}
                 className="p-1 px-4 border border-slate-300 dark:border-white/20 hover:border-red-600 dark:hover:border-red-600 hover:bg-black/5 dark:hover:bg-white/5 hover:text-red-600 transition-colors flex gap-2 items-center justify-center rounded-sm text-slate-900 dark:text-white group"
               >
                 <span className="text-xs font-mono uppercase tracking-widest font-bold">Next</span>
                 <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      )}

      <AnimatePresence>
        {selectedDriver && (
          <DriverStatsModal 
            driver={selectedDriver} 
            onClose={() => setSelectedDriver(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StandingsWidget;
