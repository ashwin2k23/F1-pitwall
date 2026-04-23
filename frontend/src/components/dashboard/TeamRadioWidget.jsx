import { useEffect, useState } from 'react';
import { Mic, Volume2 } from 'lucide-react';

const TEAM_RADIOS = [
  { time: '14:22:04', driver: 'VER', team: 'Red Bull', msg: "Tires are dropping off. Front left is graining." },
  { time: '14:25:12', driver: 'GP', team: 'Red Bull', msg: "Understood Max. Plan B is still available. Gap to Norris is 4.2s." },
  { time: '14:28:45', driver: 'NOR', team: 'McLaren', msg: "I think we can push now. The car feels good." },
  { time: '14:30:10', driver: 'LEC', team: 'Ferrari', msg: "Why did we stop? We are behind traffic now!" },
  { time: '14:31:05', driver: 'XAVI', team: 'Ferrari', msg: "We are checking... keep pushing." },
  { time: '14:35:22', driver: 'RUS', team: 'Mercedes', msg: "Hamilton is very slow in sector 2, am I clear to race?" },
];

const TeamRadioWidget = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Simulate a live feed adding messages slowly
    let currentIndex = 0;
    setMessages([TEAM_RADIOS[0]]);
    
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < TEAM_RADIOS.length) {
        setMessages(prev => [TEAM_RADIOS[currentIndex], ...prev]);
      } else {
        clearInterval(interval);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col pt-2 relative overflow-hidden bg-[#0a0a0a] border border-slate-800 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111]">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center relative">
               <Mic className="w-4 h-4 text-white" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
               <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <div>
               <div className="font-serif font-bold text-white tracking-tight">Team Radio Feed</div>
               <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Live Intercept</div>
            </div>
         </div>
         <Volume2 className="w-5 h-5 text-slate-600" />
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-auto p-6 space-y-4 scrollbar-hide">
         {messages.map((msg, i) => (
           <div key={i} className="animate-fade-in-up">
              <div className="flex items-center gap-4 mb-2">
                 <div className="text-[10px] font-mono text-slate-500">{msg.time}</div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-white bg-slate-800 px-2 py-0.5 rounded-sm">{msg.driver}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{msg.team}</span>
                 </div>
              </div>
              <div className="pl-16">
                 <div className="text-sm font-mono text-green-400 border-l-2 border-slate-700 pl-4 py-1">
                    "{msg.msg}"
                 </div>
                 {i === 0 && (
                   <div className="flex items-end gap-1 mt-2 pl-4 h-4 opacity-50">
                     <span className="w-1 bg-green-500 h-full animate-[bounce_1s_infinite]"></span>
                     <span className="w-1 bg-green-500 h-2/3 animate-[bounce_1.2s_infinite]"></span>
                     <span className="w-1 bg-green-500 h-1/2 animate-[bounce_0.8s_infinite]"></span>
                     <span className="w-1 bg-green-500 h-full animate-[bounce_1.5s_infinite]"></span>
                   </div>
                 )}
              </div>
           </div>
         ))}
      </div>
      
      {/* Gradient overlay to fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default TeamRadioWidget;
