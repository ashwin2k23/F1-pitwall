import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import RaceCalendarWidget from '../components/dashboard/RaceCalendarWidget';
import StandingsWidget from '../components/dashboard/StandingsWidget';
import AnalyticsWidget from '../components/dashboard/AnalyticsWidget';
import CountdownTimer from '../components/common/CountdownTimer';
import CarShowcaseWidget from '../components/dashboard/CarShowcaseWidget';
import WeatherStrategyWidget from '../components/dashboard/WeatherStrategyWidget';
import LiveTrackMapWidget from '../components/dashboard/LiveTrackMapWidget';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const userName = user?.preferences?.displayName || user?.email?.split('@')[0] || 'Guest';
  const [standingsMode, setStandingsMode] = useState('drivers'); // 'drivers' | 'constructors'

  return (
    <div className="pt-2 pb-20">
      {/* Ticker */}
      <div className="w-[100vw] relative left-1/2 -translate-x-1/2 bg-slate-900 text-white overflow-hidden py-1.5 mb-8 border-y border-red-600/50">
         <div className="flex whitespace-nowrap overflow-hidden">
           <div className="animate-ticker flex items-center space-x-8 text-xs font-mono tracking-widest shrink-0 px-4">
              <span>MERCEDES 135 PTS</span> <span className="text-slate-600">•</span> 
              <span className="text-red-400">NEXT MIAMI GP - MAY 1</span> <span className="text-slate-600">•</span> 
              <span>WINNER ANTONELLI - JAPAN</span> <span className="text-slate-600">•</span> 
              <span>FL RUSSELL 1:38.411</span> <span className="text-slate-600">•</span>
              <span>FASTEST PIT STOP 1.9s</span> <span className="text-slate-600">•</span>
              <span className="text-red-400 font-bold">LIVE TIMING ACTIVE</span> <span className="text-slate-600">•</span>
           </div>
           {/* Duplicate for seamless loop */}
           <div className="animate-ticker flex items-center space-x-8 text-xs font-mono tracking-widest shrink-0 px-4" aria-hidden>
              <span>MERCEDES 135 PTS</span> <span className="text-slate-600">•</span> 
              <span className="text-red-400">NEXT MIAMI GP - MAY 1</span> <span className="text-slate-600">•</span> 
              <span>WINNER ANTONELLI - JAPAN</span> <span className="text-slate-600">•</span> 
              <span>FL RUSSELL 1:38.411</span> <span className="text-slate-600">•</span>
              <span>FASTEST PIT STOP 1.9s</span> <span className="text-slate-600">•</span>
              <span className="text-red-400 font-bold">LIVE TIMING ACTIVE</span> <span className="text-slate-600">•</span>
           </div>
         </div>
      </div>

      <div className="mb-8 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter">
              <span className="capitalize">{userName}</span>'s<br/>
              <span className="text-red-600 font-bold italic">Pit Wall.</span>
            </h1>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 uppercase tracking-widest inline-block">Live Edition</div>
             <div className="text-[10px] sm:text-xs text-slate-500 mt-3 font-mono uppercase tracking-widest hidden sm:block">Personal Edition • F1 2026</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#111111] text-white p-8 md:p-12 mb-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center outline outline-1 outline-slate-800 shadow-2xl">
        {/* Subtle dot/stripe pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, transparent 1px, transparent 10px, #fff 11px)' }}></div>
        
        <div className="relative z-10 w-full md:w-1/2 mb-8 md:mb-0 border-l-4 border-red-600 pl-6">
           <div className="text-red-500 text-xs font-bold tracking-widest mb-4 flex items-center gap-2">
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
             ROUND 04 • UP NEXT • US
           </div>
           <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">Miami <span className="text-red-500 italic block mt-1">Grand Prix</span></h2>
           <p className="text-sm text-gray-400 mb-6 max-w-sm leading-relaxed">Miami International Autodrome • Hard Rock Stadium<br/>Round 4 of 23 • 57 laps • 308.326 km</p>
           
           <div className="flex gap-12 border-t border-white/10 pt-6">
              <div>
                <div className="text-[10px] text-red-500/80 tracking-widest mb-1">LAP RECORD</div>
                <div className="font-mono text-sm tracking-wide">1:29.708</div>
              </div>
              <div>
                <div className="text-[10px] text-red-500/80 tracking-widest mb-1">POLE 2026</div>
                <div className="font-mono text-sm tracking-wide">M. Verstappen</div>
              </div>
              <div>
                <div className="text-[10px] text-red-500/80 tracking-widest mb-1">DATES</div>
                <div className="font-mono text-sm tracking-wide">MAY 1 - MAY 3</div>
              </div>
           </div>
        </div>

        <div className="relative z-10 mt-6 md:mt-0">
           <div className="flex items-center gap-2 mb-3">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
             <div className="text-[10px] text-red-500 tracking-widest font-bold">LIGHTS OUT IN</div>
           </div>
           <CountdownTimer targetDate="2026-05-01T15:00:00Z" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
        {/* Main Column */}
        <div className="lg:col-span-8 flex flex-col gap-12">
           <div>
             <div className="flex justify-between items-end mb-4">
               <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                 {standingsMode === 'drivers' ? "Driver's " : "Constructor's "} 
                 <span className="text-red-600 italic">Cup</span>
               </h3>
               <button 
                 onClick={() => setStandingsMode(prev => prev === 'drivers' ? 'constructors' : 'drivers')} 
                 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors"
               >
                 View {standingsMode === 'drivers' ? 'Constructors' : 'Drivers'}
               </button>
             </div>
             <div className="editorial-border">
               <StandingsWidget mode={standingsMode} />
             </div>
           </div>

           <div>
             <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Challengers <span className="text-red-600 italic">2026</span></h3>
             <div className="editorial-border">
               <CarShowcaseWidget />
             </div>
           </div>

           <div>
             <div className="h-96">
               <LiveTrackMapWidget />
             </div>
           </div>
        </div>
        
        {/* Side Column */}
        <div className="lg:col-span-4 space-y-12">
           <div>
             <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Season <span className="text-red-600 italic">Calendar</span></h3>
             <div className="editorial-border">
               <RaceCalendarWidget />
             </div>
           </div>

           <div>
             <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Track <span className="text-red-600 italic">Radar</span></h3>
             <div className="editorial-border h-auto pb-4">
               <WeatherStrategyWidget />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
