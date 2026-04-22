import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAMS = [
  {
    id: 'mclaren',
    name: 'McLaren',
    car: 'MCL40',
    power: 'Mercedes-Benz',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mclaren.png'
  },
  {
    id: 'redbull',
    name: 'Red Bull Racing',
    car: 'RB22',
    power: 'Honda RBPT',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/red-bull-racing.png'
  },
  {
    id: 'ferrari',
    name: 'Ferrari',
    car: 'SF-26',
    power: 'Ferrari',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/ferrari.png'
  },
  {
    id: 'mercedes',
    name: 'Mercedes',
    car: 'W17',
    power: 'Mercedes-Benz',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/mercedes.png'
  },
  {
    id: 'aston',
    name: 'Aston Martin',
    car: 'AMR26',
    power: 'Honda',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/aston-martin.png'
  },
  {
    id: 'alpine',
    name: 'Alpine',
    car: 'A526',
    power: 'Renault',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/alpine.png'
  },
  {
    id: 'williams',
    name: 'Williams',
    car: 'FW48',
    power: 'Mercedes-Benz',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/williams.png'
  },
  {
    id: 'haas',
    name: 'Haas',
    car: 'VF-26',
    power: 'Ferrari',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/haas-f1-team.png'
  },
  {
    id: 'audi',
    name: 'Audi',
    car: 'F1 e-tron',
    power: 'Audi',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/kick-sauber.png'
  },
  {
    id: 'rb',
    name: 'RB',
    car: 'VCARB 03',
    power: 'Honda RBPT',
    image: 'https://media.formula1.com/d_team_car_fallback_image.png/content/dam/fom-website/teams/2024/rb.png'
  }
];

const CarShowcaseWidget = () => {
  const [activeTeam, setActiveTeam] = useState(TEAMS[0]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#050505]">
      {/* Team Selector Ribbon */}
      <div className="flex justify-start overflow-x-auto border-b border-black/10 dark:border-white/10 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TEAMS.map((team) => (
          <button
            key={team.id}
            onClick={() => setActiveTeam(team)}
            className={`px-4 py-3 text-[10px] font-mono tracking-widest uppercase transition-colors whitespace-nowrap border-b-2 outline-none
              ${activeTeam.id === team.id 
                ? 'border-red-600 text-red-600 font-bold bg-white dark:bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }
            `}
          >
            {team.name}
          </button>
        ))}
      </div>

      {/* Showcase Area */}
      <div className="flex-1 p-6 relative min-h-[300px] flex items-center justify-center overflow-hidden">
         {/* Background accent wordmark */}
         <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full text-center text-slate-300 dark:text-white opacity-[0.03] select-none pointer-events-none text-7xl md:text-9xl font-serif font-black italic tracking-tighter transition-all duration-700">
            {activeTeam.car}
         </div>

         <AnimatePresence mode="popLayout">
           <motion.div
             key={activeTeam.id}
             initial={{ opacity: 0, x: 150, skewX: -10 }}
             animate={{ opacity: 1, x: 0, skewX: 0 }}
             exit={{ opacity: 0, x: -150, skewX: 10 }}
             transition={{ type: "spring", stiffness: 150, damping: 20 }}
             className="relative z-10 w-full"
           >
             <div className="flex justify-between items-start absolute top-[-20px] left-0 w-full z-20 pointer-events-none">
               <div>
                 <div className="text-[10px] font-mono text-red-600 font-bold tracking-widest uppercase mb-1">Chassis</div>
                 <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white">{activeTeam.car}</h4>
               </div>
               <div className="text-right">
                 <div className="text-[10px] font-mono text-red-600 font-bold tracking-widest uppercase mb-1">Power Unit</div>
                 <h4 className="text-sm font-serif font-bold text-slate-700 dark:text-gray-300">{activeTeam.power}</h4>
               </div>
             </div>

             <div className="relative mt-8 w-full max-w-[650px] mx-auto group cursor-pointer">
               {/* Ground shadow beneath the car */}
               <div className="absolute -bottom-[20px] left-1/2 -translate-x-1/2 w-[75%] h-5 bg-black/40 dark:bg-black/80 blur-xl rounded-[100%] transition-opacity duration-500 group-hover:opacity-90 group-hover:w-[85%]"></div>
               
               <img 
                 src={activeTeam.image} 
                 alt={activeTeam.name} 
                 style={{ imageRendering: 'high-quality', WebkitFontSmoothing: 'antialiased' }}
                 className="relative z-10 w-full object-contain filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)] saturate-150 contrast-125 transition-transform duration-700 ease-out group-hover:scale-[1.07]" 
               />
             </div>
           </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
};

export default CarShowcaseWidget;
