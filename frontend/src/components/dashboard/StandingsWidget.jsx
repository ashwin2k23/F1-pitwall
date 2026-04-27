import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DriverStatsModal from './DriverStatsModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDriverImage } from '../../utils/driverImages';

const CAR_IMAGES = {
  mclaren: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mclaren.png',
  redbull: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/red-bull-racing.png',
  ferrari: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/ferrari.png',
  mercedes: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mercedes.png',
  aston: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/aston-martin.png',
  alpine: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/alpine.png',
  williams: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/williams.png',
  haas: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/haas-f1-team.png',
  sauber: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/kick-sauber.png',
  audi: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/kick-sauber.png',
  rb: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/rb.png'
};

const getTeamColors = (teamName) => {
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

const getCarImage = (teamName) => {
  const name = teamName.toLowerCase();
  for (const key of Object.keys(CAR_IMAGES)) {
    if (name.includes(key)) return CAR_IMAGES[key];
  }
  return CAR_IMAGES['mclaren'];
};

const Top3Podium = ({ mode, data, allDrivers, onSelectDriver }) => {
  const podium = [data[1], data[0], data[2]];
  
  if (mode === 'drivers') {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        {podium.map((item, idx) => {
          if (!item) return null;
          const isFirst = item.pos === '1';
          return (
            <div 
              key={item.pos}
              onClick={() => onSelectDriver(item)}
              className={`relative rounded-xl overflow-hidden shadow-xl flex-1 cursor-pointer transition-transform hover:-translate-y-1 ${getTeamColors(item.team)}`}
              style={{ height: isFirst ? '320px' : '290px' }}
            >
              <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px'}}></div>
              <div className="p-4 md:p-5 flex flex-col h-full relative z-10 justify-between">
                <div>
                  <div className="text-3xl font-black italic drop-shadow-md">{item.pos === '1' ? '1ST' : item.pos === '2' ? '2ND' : '3RD'}</div>
                  <div className="mt-4">
                    <div className="text-lg font-bold opacity-90 drop-shadow-md leading-tight">{item.name.split(' ')[0]}</div>
                    <div className="text-2xl md:text-3xl font-black leading-none drop-shadow-md">{item.name.split(' ').slice(1).join(' ')}</div>
                  </div>
                  <div className="text-xs mt-2 opacity-90 font-bold drop-shadow-md">{item.team}</div>
                </div>
                <div className="flex items-end justify-between">
                   <div className="flex items-baseline gap-1 drop-shadow-md">
                      <span className="text-3xl md:text-4xl font-black">{item.pts}</span>
                      <span className="text-xs font-bold uppercase">PTS</span>
                   </div>
                </div>
              </div>
              <img src={getDriverImage(item.name)} className="absolute bottom-0 right-[-10%] h-[85%] object-contain object-bottom z-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" alt={item.name} />
            </div>
          )
        })}
      </div>
    );
  } else {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
        {podium.map((item) => {
          if (!item) return null;
          const isFirst = item.pos === '1';
          const teamDrivers = allDrivers.filter(d => d.team === item.name).map(d => d.name);
          return (
            <div 
              key={item.pos}
              className={`relative rounded-xl overflow-hidden shadow-xl flex-1 transition-transform hover:-translate-y-1 ${getTeamColors(item.name)}`}
              style={{ height: isFirst ? '300px' : '270px' }}
            >
              <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '8px 8px'}}></div>
              <div className="p-4 md:p-5 flex flex-col h-full relative z-10">
                <div className="text-3xl font-black italic drop-shadow-md">{item.pos === '1' ? '1ST' : item.pos === '2' ? '2ND' : '3RD'}</div>
                <div className="mt-2 text-2xl md:text-3xl font-black leading-tight drop-shadow-md">{item.name}</div>
                <div className="flex items-baseline gap-1 mt-1 drop-shadow-md">
                  <span className="text-2xl md:text-3xl font-black">{item.pts}</span>
                  <span className="text-[10px] font-bold uppercase">PTS</span>
                </div>
                <div className="mt-4 text-xs font-bold leading-relaxed opacity-90 drop-shadow-md">
                  {teamDrivers.map(d => <div key={d}>{d}</div>)}
                </div>
              </div>
              <img src={getCarImage(item.name)} className="absolute bottom-4 right-[-5%] w-[100%] object-contain z-0 drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] saturate-150" alt={item.name} />
            </div>
          )
        })}
      </div>
    );
  }
};


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

  let listItems = currentItems;
  let top3 = [];
  if (currentPage === 0 && currentData.length >= 3) {
    top3 = currentData.slice(0, 3);
    listItems = currentItems.slice(3);
  }

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
              {currentPage === 0 && top3.length >= 3 && (
                <Top3Podium mode={mode} data={top3} allDrivers={drivers} onSelectDriver={setSelectedDriver} />
              )}
              {listItems.map((item) => (
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
