import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import RaceDetailsModal from './RaceDetailsModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RaceCalendarWidget = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await axios.get('https://api.jolpi.ca/ergast/f1/current.json');
        setRaces(res.data.MRData.RaceTable.Races); // Full 24-race calendar
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  if (loading) {
     return <div className="text-slate-500 text-sm py-4 animate-pulse">Syncing FIA Calendar...</div>;
  }

  const totalPages = Math.ceil(races.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentRaces = races.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <>
      <div className="flex flex-col h-full justify-between">
         <div className="flex flex-col">
           {currentRaces.map((race) => (
             <div 
               key={race.round} 
               onClick={() => setSelectedRace(race)}
               className="flex items-center gap-6 py-3 border-b border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer group"
             >
                <div className="flex flex-col w-12 shrink-0 border-r border-slate-300 dark:border-white/20 transition-colors group-hover:border-red-600">
                   <span className="text-[10px] text-slate-400 group-hover:text-red-500 font-mono uppercase tracking-widest leading-none mb-1 transition-colors">Rnd</span>
                   <span className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-none transition-transform origin-left group-hover:scale-110 group-hover:text-red-600 dark:group-hover:text-red-500">{String(race.round).padStart(2, '0')}</span>
                </div>
                <div className="flex-1">
                   <div className="font-serif font-bold text-slate-900 dark:text-white capitalize transition-colors group-hover:text-red-600 dark:group-hover:text-red-400">{race.raceName.replace('Grand Prix', 'GP')}</div>
                   <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mt-1">{race.Circuit.circuitName}</div>
                </div>
                <div className="text-right shrink-0">
                   <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{race.date.split('-').slice(1).join('/')}</div>
                   <div className="text-[9px] font-mono uppercase text-slate-500 tracking-widest">{race.time ? race.time.replace('Z', ' UTC') : 'TBD'}</div>
                </div>
             </div>
           ))}
         </div>

         {/* Pagination Controls */}
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
      </div>

      <AnimatePresence>
        {selectedRace && (
          <RaceDetailsModal 
            race={selectedRace} 
            onClose={() => setSelectedRace(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default RaceCalendarWidget;
