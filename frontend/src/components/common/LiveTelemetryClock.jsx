import { useState, useEffect } from 'react';

const LiveTelemetryClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let animationFrameId;
    
    // Use requestAnimationFrame for high-precision updates to show milliseconds
    const updateTime = () => {
      setTime(new Date());
      animationFrameId = requestAnimationFrame(updateTime);
    };
    
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Format time components
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const milliseconds = Math.floor(time.getMilliseconds() / 10).toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2 bg-[#050505] border border-slate-800 rounded px-3 py-1 shadow-inner relative overflow-hidden group">
      {/* Glowing accent border top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
      
      <div className="flex flex-col">
        <span className="text-[7px] text-red-600 font-mono font-bold tracking-widest uppercase mb-[-2px] opacity-80">Local Time</span>
        <div className="flex items-baseline font-mono font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]">
          <span className="text-sm">{hours}</span>
          <span className="text-xs text-slate-500 animate-[pulse_1s_ease-in-out_infinite] mx-[1px]">:</span>
          <span className="text-sm">{minutes}</span>
          <span className="text-xs text-slate-500 mx-[1px]">:</span>
          <span className="text-sm text-slate-300">{seconds}</span>
          <span className="text-[10px] text-red-500 ml-1 opacity-80 w-4 text-right">.{milliseconds}</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTelemetryClock;
