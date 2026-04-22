import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// Static fallback intel database since Ergast doesn't provide these specifics immediately
const TRACK_INTEL = {
  bahrain: {
    length: '5.412 km', laps: 57, corners: 15, lapRecord: '1:31.447 (Pedro de la Rosa, 2005)',
    mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/bahrain-3.svg',
    photoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756bfed4f?q=80&w=2670&auto=format&fit=crop',
    pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2023)', 'Charles Leclerc (2022)']
  },
  jeddah: {
     length: '6.174 km', laps: 50, corners: 27, lapRecord: '1:30.734 (Lewis Hamilton, 2021)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/jeddah-1.svg',
     photoUrl: 'https://images.unsplash.com/photo-1678184511599-4d6cbcee29b3?q=80&w=2500&auto=format&fit=crop',
     pastWinners: ['Max Verstappen (2024)', 'Sergio Perez (2023)', 'Max Verstappen (2022)']
  },
  albert_park: {
     length: '5.278 km', laps: 58, corners: 14, lapRecord: '1:19.813 (Charles Leclerc, 2024)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/melbourne-2.svg',
     photoUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2670&auto=format&fit=crop',
     pastWinners: ['Carlos Sainz (2024)', 'Max Verstappen (2023)', 'Charles Leclerc (2022)']
  },
  suzuka: {
     length: '5.807 km', laps: 53, corners: 18, lapRecord: '1:30.983 (Lewis Hamilton, 2019)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/suzuka-2.svg',
     photoUrl: 'https://images.unsplash.com/photo-1508344928928-7137b29de216?q=80&w=2670&auto=format&fit=crop',
     pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  shanghai: {
     length: '5.451 km', laps: 56, corners: 16, lapRecord: '1:32.238 (Michael Schumacher, 2004)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/shanghai-1.svg',
     photoUrl: 'https://images.unsplash.com/photo-1510461623351-41bd171fe798?q=80&w=2670&auto=format&fit=crop',
     pastWinners: ['Lando Norris (2024)', 'Max Verstappen (2023)', 'Lewis Hamilton (2019)']
  },
  miami: {
     length: '5.412 km', laps: 57, corners: 19, lapRecord: '1:29.708 (Max Verstappen, 2023)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/miami-1.svg',
     photoUrl: 'https://images.unsplash.com/photo-1627976856515-3bd4ba1ef37f?q=80&w=2670&auto=format&fit=crop',
     pastWinners: ['Lando Norris (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  imola: {
     length: '4.909 km', laps: 63, corners: 19, lapRecord: '1:15.484 (Lewis Hamilton, 2020)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/imola-3.svg', photoUrl: 'https://images.unsplash.com/photo-1516496636080-14fb876b0521?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2022)', 'Max Verstappen (2021)']
  },
  monaco: {
     length: '3.337 km', laps: 78, corners: 19, lapRecord: '1:12.909 (Lewis Hamilton, 2021)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/monaco-6.svg', photoUrl: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Charles Leclerc (2024)', 'Max Verstappen (2023)', 'Sergio Perez (2022)']
  },
  villeneuve: {
     length: '4.361 km', laps: 70, corners: 14, lapRecord: '1:13.078 (Valtteri Bottas, 2019)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/montreal-6.svg', photoUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  catalunya: {
     length: '4.657 km', laps: 66, corners: 14, lapRecord: '1:16.330 (Max Verstappen, 2023)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/catalunya-6.svg', photoUrl: 'https://images.unsplash.com/photo-1539037116277-4db20d58aa31?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  red_bull_ring: {
     length: '4.318 km', laps: 71, corners: 10, lapRecord: '1:05.619 (Carlos Sainz, 2020)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/spielberg-3.svg', photoUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2670&auto=format&fit=crop', pastWinners: ['George Russell (2024)', 'Max Verstappen (2023)', 'Charles Leclerc (2022)']
  },
  silverstone: {
     length: '5.891 km', laps: 52, corners: 18, lapRecord: '1:27.097 (Max Verstappen, 2020)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/silverstone-8.svg', photoUrl: 'https://images.unsplash.com/photo-1698246738927-463d1ed1d88a?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Lewis Hamilton (2024)', 'Max Verstappen (2023)', 'Carlos Sainz (2022)']
  },
  hungaroring: {
     length: '4.381 km', laps: 70, corners: 14, lapRecord: '1:16.627 (Lewis Hamilton, 2020)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/hungaroring-3.svg', photoUrl: 'https://images.unsplash.com/photo-1563820245089-da65dff8d380?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Oscar Piastri (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  spa: {
     length: '7.004 km', laps: 44, corners: 19, lapRecord: '1:46.286 (Valtteri Bottas, 2018)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/spa-francorchamps-4.svg', photoUrl: 'https://images.unsplash.com/photo-1647466810266-9e909a3cf34b?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Lewis Hamilton (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  zandvoort: {
     length: '4.259 km', laps: 72, corners: 14, lapRecord: '1:11.097 (Lewis Hamilton, 2021)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/zandvoort-5.svg', photoUrl: 'https://images.unsplash.com/photo-1580226383363-263a23a19fc8?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Lando Norris (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  monza: {
     length: '5.793 km', laps: 53, corners: 11, lapRecord: '1:21.046 (Rubens Barrichello, 2004)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/monza-7.svg', photoUrl: 'https://images.unsplash.com/photo-1600706432502-77a0e2e32773?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Charles Leclerc (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  baku: {
     length: '6.003 km', laps: 51, corners: 20, lapRecord: '1:43.009 (Charles Leclerc, 2019)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/baku-1.svg', photoUrl: 'https://images.unsplash.com/photo-1627976856515-3bd4ba1ef37f?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Oscar Piastri (2024)', 'Sergio Perez (2023)', 'Max Verstappen (2022)']
  },
  marina_bay: {
     length: '4.940 km', laps: 62, corners: 19, lapRecord: '1:35.867 (Lewis Hamilton, 2023)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/marina-bay-4.svg', photoUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Lando Norris (2024)', 'Carlos Sainz (2023)', 'Sergio Perez (2022)']
  },
  americas: {
     length: '5.513 km', laps: 56, corners: 20, lapRecord: '1:36.169 (Charles Leclerc, 2019)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/austin-1.svg', photoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756bfed4f?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Charles Leclerc (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  rodriguez: {
     length: '4.304 km', laps: 71, corners: 17, lapRecord: '1:17.774 (Valtteri Bottas, 2021)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/mexico-city-3.svg', photoUrl: 'https://images.unsplash.com/photo-1510461623351-41bd171fe798?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Carlos Sainz (2024)', 'Max Verstappen (2023)', 'Max Verstappen (2022)']
  },
  interlagos: {
     length: '4.309 km', laps: 71, corners: 15, lapRecord: '1:10.540 (Valtteri Bottas, 2018)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/interlagos-2.svg', photoUrl: 'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2024)', 'Max Verstappen (2023)', 'George Russell (2022)']
  },
  las_vegas: {
     length: '6.201 km', laps: 50, corners: 17, lapRecord: '1:35.490 (Oscar Piastri, 2023)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/las-vegas-1.svg', photoUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2023)', 'TBA', 'TBA']
  },
  losail: {
     length: '5.419 km', laps: 57, corners: 16, lapRecord: '1:24.319 (Max Verstappen, 2023)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/lusail-1.svg', photoUrl: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2023)', 'Lewis Hamilton (2021)']
  },
  yas_marina: {
     length: '5.281 km', laps: 58, corners: 16, lapRecord: '1:26.103 (Max Verstappen, 2021)',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/yas-marina-2.svg', photoUrl: 'https://images.unsplash.com/photo-1582260655060-e88102377488?q=80&w=2670&auto=format&fit=crop', pastWinners: ['Max Verstappen (2023)', 'Max Verstappen (2022)', 'Max Verstappen (2021)']
  },
  // Default fallback
  default: {
     length: 'TBD', laps: 'TBD', lapRecord: 'TBA', corners: 'TBA',
     mapUrl: 'https://raw.githubusercontent.com/julesr0y/f1-circuits-svg/main/circuits/minimal/black/bahrain-3.svg',
     photoUrl: 'https://images.unsplash.com/photo-1563820245089-da65dff8d380?q=80&w=2670&auto=format&fit=crop',
     pastWinners: ['Awaiting Race... (2024)', 'Data Protected (2023)', 'FIA Archives (2022)']
  }
};

const RaceDetailsModal = ({ race, onClose }) => {
  if (!race) return null;

  const circuitId = race.Circuit.circuitId;
  const intel = TRACK_INTEL[circuitId] || TRACK_INTEL.default;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] overflow-hidden outline outline-1 outline-slate-200 dark:outline-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col md:flex-row z-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/5 dark:bg-white/5 hover:bg-red-600 text-slate-500 hover:text-white transition-colors rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Cinematic Photo & Hero */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 overflow-hidden">
           {/* Cinematic Background Photo */}
           <div className="absolute inset-0 z-0">
              <img src={intel.photoUrl} alt="Location Vibe" className="w-full h-full object-cover opacity-20 dark:opacity-[0.15] scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#050505] dark:via-[#050505]/80"></div>
           </div>

           <div className="relative z-10">
             <div className="text-[10px] text-red-600 font-mono tracking-widest uppercase font-bold mb-2 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
               Track Layout Data
             </div>
             <h2 className="text-3xl font-serif text-slate-900 dark:text-white leading-tight mb-8">
               {race.Circuit.circuitName}
             </h2>
             <div className="w-full h-48 md:h-64 flex items-center justify-center p-4 relative">
                {intel.mapUrl ? (
                  <img 
                     src={intel.mapUrl} 
                     alt="Circuit Map" 
                     onError={(e) => { 
                       e.target.style.display = 'none'; 
                       e.target.nextElementSibling.style.display = 'flex'; 
                     }}
                     style={{ imageRendering: 'high-quality' }}
                     className="w-full h-full object-contain filter dark:invert dark:opacity-80 drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 duration-700" 
                  />
                ) : null}
                
                {/* Fallback Telemetry Radar */}
                <div 
                   className="w-full h-full flex flex-col items-center justify-center border border-red-600/30 rounded-full bg-red-600/5"
                   style={{ display: intel.mapUrl ? 'none' : 'flex' }}
                >
                   <div className="w-24 h-24 rounded-full border border-red-500/50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-20"></div>
                      <div className="w-1 h-full bg-gradient-to-b from-transparent via-red-500 to-transparent animate-spin"></div>
                   </div>
                   <div className="text-[10px] font-mono tracking-widest uppercase text-red-500 mt-6 animate-pulse">
                     Acquiring Telemetry...
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Right Side - Intel Data */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
           <div>
             <div className="flex items-end gap-3 mb-6">
               <span className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-none whitespace-pre-wrap">{race.raceName.replace(' Grand Prix', '\nGrand Prix')}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-slate-900 dark:border-white pt-6 mb-8">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Length</div>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{intel.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Race Laps</div>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{intel.laps}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Corners</div>
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">{intel.corners}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-1">Lap Record</div>
                  <div className="font-mono text-[10px] leading-tight text-slate-700 dark:text-gray-300 max-w-[140px] pr-2">{intel.lapRecord}</div>
                </div>
             </div>
           </div>

           <div>
             <div className="text-[10px] text-red-600 font-mono tracking-widest uppercase font-bold mb-3 border-b border-red-600/30 pb-2 inline-block">Hall of Fame</div>
             <div className="space-y-2 mt-2">
                {intel.pastWinners.map((winner, idx) => {
                  const [name, year] = winner.split(' (');
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-black/5 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                       <span className="font-serif font-bold text-slate-900 dark:text-gray-200 text-sm tracking-tight">{name}</span>
                       <span className="font-mono text-slate-400 tracking-widest">{year?.replace(')', '')}</span>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RaceDetailsModal;
