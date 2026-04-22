import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import DriverStatsModal from './DriverStatsModal';

const StandingsWidget = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await axios.get('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        const standings = res.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        
        const mapped = standings.map((item) => {
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
        setDrivers(mapped);
      } catch (err) {
        console.error('Failed to fetch real standings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-auto pr-2 mt-4 scrollbar-hide">
        {loading ? (
           <div className="text-slate-500 dark:text-gray-400 text-sm animate-pulse">Loading live telemetry...</div>
        ) : (
          <div className="space-y-3">
            {drivers.map((driver) => (
              <div 
                key={driver.pos}
                onClick={() => setSelectedDriver(driver)}
                className={`flex items-center justify-between py-3 border-b border-slate-200 dark:border-white/10 ${driver.color.replace('border-l-4', 'border-l-2')} hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group`}
              >
                <div className="flex items-center gap-4 pl-3">
                  <span className="font-mono text-[10px] text-slate-400 dark:text-gray-500 w-4 font-bold group-hover:text-red-500 transition-colors">{String(driver.pos).padStart(2, '0')}</span>
                  <div>
                    <div className="font-serif font-bold tracking-tight text-slate-900 dark:text-white text-base leading-tight group-hover:text-red-600 transition-colors">{driver.name}</div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-slate-500 dark:text-gray-500">{driver.team}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 pr-3">
                   <div className="font-mono font-bold text-lg text-slate-900 dark:text-white group-hover:text-red-500 transition-colors">
                     {driver.pts}
                   </div>
                   <div className="text-[9px] text-red-500 font-bold tracking-widest hidden sm:block">PTS</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
