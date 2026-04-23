import { CloudRain, Wind, Thermometer, Droplets } from 'lucide-react';

const WeatherStrategyWidget = () => {
  return (
    <div className="h-full flex flex-col justify-between py-2">
      {/* Weather Matrix */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600 font-bold tracking-widest text-[10px] uppercase font-mono">
             <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
             Live Track Radar
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Miami, US</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-sm border border-slate-200 dark:border-white/10 flex flex-col justify-between">
              <Thermometer className="w-4 h-4 text-slate-500 mb-2" />
              <div className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-1">Track Temp</div>
              <div className="text-3xl font-serif font-bold text-slate-900 dark:text-white">42°<span className="text-lg text-slate-400">C</span></div>
           </div>
           <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-sm border border-slate-200 dark:border-white/10 flex flex-col justify-between">
              <CloudRain className="w-4 h-4 text-blue-500 mb-2" />
              <div className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-1">Rain Prob</div>
              <div className="text-3xl font-serif font-bold text-blue-500">15%</div>
           </div>
        </div>
        
        <div className="mt-4 flex gap-4 text-xs font-mono tracking-widest text-slate-500 uppercase">
           <div className="flex items-center gap-2"><Wind className="w-3 h-3"/> 12 km/h</div>
           <div className="flex items-center gap-2"><Droplets className="w-3 h-3"/> 68% Hum</div>
        </div>
      </div>

      {/* Pirelli Strategy */}
      <div className="border-t border-slate-200 dark:border-white/10 pt-6">
         <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif font-bold text-slate-900 dark:text-white">Pirelli Strategy Forecast</h4>
            <div className="text-[9px] font-mono bg-slate-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-sm font-bold uppercase">AWS Powered</div>
         </div>
         
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-16 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">1 Stop</div>
               <div className="flex-1 h-2 flex rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-1/3"></div>
                  <div className="h-full bg-white border-y border-r border-slate-300 w-2/3"></div>
               </div>
               <div className="w-12 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">L 18-24</div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="w-16 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">2 Stop</div>
               <div className="flex-1 h-2 flex rounded-full overflow-hidden opacity-50">
                  <div className="h-full bg-red-500 w-1/4"></div>
                  <div className="h-full bg-yellow-400 w-1/3"></div>
                  <div className="h-full bg-yellow-400 w-5/12 border-l border-black/20"></div>
               </div>
               <div className="w-12 text-right font-mono text-xs font-bold text-slate-500">Slower</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default WeatherStrategyWidget;
