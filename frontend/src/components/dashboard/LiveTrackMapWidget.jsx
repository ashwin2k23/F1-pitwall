import React, { useEffect, useState, useRef } from 'react';
import { Map, Clock, Flag, Zap } from 'lucide-react';

// SVG path data for Monaco circuit outline (simplified)
const MONACO_PATH = "M 200 30 L 320 30 Q 350 30 360 55 L 370 90 Q 375 110 360 125 L 300 160 L 280 200 Q 270 225 245 230 L 200 235 Q 170 238 155 215 L 140 185 L 120 170 Q 95 155 90 130 L 88 100 Q 85 70 105 55 L 140 38 Z";

const CircuitSVG = ({ raceName }) => {
  // Different simplified SVG shapes per known circuits
  const circuits = {
    'Monaco Grand Prix': {
      viewBox: "80 20 300 230",
      path: "M 200 30 C 240 28 290 25 330 40 C 355 50 365 70 368 95 C 371 118 360 135 340 150 L 300 172 L 275 205 C 262 228 238 238 210 238 C 182 238 160 228 148 208 L 132 182 L 108 165 C 90 152 84 130 86 106 C 88 82 100 62 122 50 Z",
      color: '#00ffcc',
      laps: 78,
      length: '3.337 km',
      turns: 19,
    },
    'default': {
      viewBox: "60 20 380 260",
      path: "M 180 40 L 330 40 Q 380 40 400 80 L 420 140 Q 430 180 400 210 L 330 240 L 180 240 Q 130 240 110 200 L 90 140 Q 80 100 110 70 Z",
      color: '#ef4444',
      laps: 57,
      length: '5.303 km',
      turns: 16,
    }
  };

  const circuit = circuits[raceName] || circuits['default'];

  return (
    <svg viewBox={circuit.viewBox} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Glow filter */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Track shadow/glow */}
      <path d={circuit.path} fill="none" stroke={circuit.color} strokeWidth="14" strokeOpacity="0.08" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Track base */}
      <path d={circuit.path} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Track outline */}
      <path d={circuit.path} fill="none" stroke={circuit.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" strokeDasharray="1200" strokeDashoffset="0">
        <animate attributeName="stroke-dashoffset" from="1200" to="0" dur="2.5s" ease="easeInOut" fill="freeze"/>
      </path>
      {/* Start/finish line */}
      <line x1="197" y1="28" x2="197" y2="42" stroke="#ffffff" strokeWidth="2" opacity="0.6"/>
      <text x="205" y="38" fill="#ffffff" fontSize="7" fontFamily="monospace" opacity="0.5">S/F</text>
    </svg>
  );
};

const LiveTrackMapWidget = () => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [nextRace, setNextRace] = useState(null);
  const canvasRef = useRef(null);

  // Fetch next race info from Ergast
  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();
        const upcoming = races.find(r => new Date(r.date) >= now);
        if (upcoming) setNextRace(upcoming);
      } catch (e) {
        console.error('[LiveTrackMapWidget] next race fetch error:', e);
      }
    };
    fetchNextRace();
  }, []);

  useEffect(() => {
    const detectSession = async () => {
      // --- Primary: Ergast schedule with LOCAL date (fixes UTC+5:30 timezone issue) ---
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
        const data = await res.json();
        const races = data?.MRData?.RaceTable?.Races || [];
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

        for (const race of races) {
          const sessionDates = [
            race.FirstPractice?.date,
            race.SecondPractice?.date,
            race.ThirdPractice?.date,
            race.Sprint?.date,
            race.SprintQualifying?.date,
            race.Qualifying?.date,
            race.date,
          ].filter(Boolean);

          if (sessionDates.includes(todayStr)) {
            setIsLive(true);
            // Try OpenF1 for live GPS as a bonus — not required
            try {
              const locRes = await fetch('https://api.openf1.org/v1/location?session_key=latest');
              if (locRes.ok) {
                const locData = await locRes.json();
                setLocations((locData || []).slice(-1000));
              }
            } catch (_) {}
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('[LiveTrackMapWidget] Ergast check failed:', e);
      }

      // --- Secondary: try OpenF1 directly ---
      try {
        const res = await fetch('https://api.openf1.org/v1/sessions?session_key=latest');
        if (!res.ok) throw new Error('OpenF1 auth required');
        const data = await res.json();
        if (data && data.length > 0) {
          const session = data[0];
          const now = new Date();
          const startDate = new Date(session.date_start);
          const sessionEndTime = session.date_end
            ? new Date(session.date_end)
            : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          if (now >= startDate && now <= sessionEndTime) {
            setIsLive(true);
            try {
              const locRes = await fetch('https://api.openf1.org/v1/location?session_key=latest');
              const locData = await locRes.json();
              setLocations(locData.slice(-1000));
            } catch (_) {}
            setLoading(false);
            return;
          }
        }
      } catch (_) {}

      setIsLive(false);
      setLoading(false);
    };

    detectSession();
  }, []);

  // Draw live GPS canvas when live
  useEffect(() => {
    if (isLive && locations.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      locations.forEach(loc => {
        if (loc.x < minX) minX = loc.x;
        if (loc.x > maxX) maxX = loc.x;
        if (loc.y < minY) minY = loc.y;
        if (loc.y > maxY) maxY = loc.y;
      });
      const padding = 20;
      const scaleX = (width - padding * 2) / (maxX - minX || 1);
      const scaleY = (height - padding * 2) / (maxY - minY || 1);
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (width - (maxX - minX) * scale) / 2;
      const offsetY = (height - (maxY - minY) * scale) / 2;
      ctx.beginPath();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      locations.forEach((loc, i) => {
        const cx = (loc.x - minX) * scale + offsetX;
        const cy = height - ((loc.y - minY) * scale + offsetY);
        i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      if (locations.length > 0) {
        const last = locations[locations.length - 1];
        const cx = (last.x - minX) * scale + offsetX;
        const cy = height - ((last.y - minY) * scale + offsetY);
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    }
  }, [isLive, locations]);

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#0a0a0a] border border-slate-800 rounded-md p-6">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xs font-mono text-slate-500">CONNECTING TO TELEMETRY...</div>
      </div>
    );
  }

  // Live GPS mode
  if (isLive) {
    return (
      <div className="h-full flex flex-col pt-2 relative overflow-hidden bg-[#0a0a0a] border border-slate-800 rounded-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center relative">
              <Map className="w-4 h-4 text-white" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div>
              <div className="font-serif font-bold text-white tracking-tight">Live Track GPS</div>
              <div className="text-[10px] font-mono tracking-widest text-red-400 uppercase">● Live Session Active</div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center p-4 relative">
          <canvas ref={canvasRef} width={400} height={250} className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]"/>
          <div className="absolute bottom-4 left-4 flex gap-2 items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-mono text-slate-400">LIVE FEED</span>
          </div>
        </div>
      </div>
    );
  }

  // Between races — show next circuit preview
  const raceName = nextRace?.raceName || 'Monaco Grand Prix';
  const circuitName = nextRace?.Circuit?.circuitName || 'Circuit de Monaco';
  const locality = nextRace?.Circuit?.Location?.locality || 'Monaco';
  const country = nextRace?.Circuit?.Location?.country || 'Monaco';
  const raceDate = nextRace?.date ? new Date(nextRace.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '25 May';
  const round = nextRace?.round || '8';

  const sessions = [
    { label: 'Practice 1', time: nextRace?.FirstPractice?.date || '—' },
    { label: 'Qualifying', time: nextRace?.Qualifying?.date || '—' },
    { label: 'Race', time: nextRace?.date || '—' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0a0a0a] border border-slate-800 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0f0f0f]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <Map className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">Next Circuit</div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Round {round} Preview</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Race Day</div>
          <div className="text-sm font-bold text-white font-mono">{raceDate}</div>
        </div>
      </div>

      {/* Circuit name */}
      <div className="px-4 pt-3 pb-1">
        <div className="text-xs font-mono text-[#00ffcc] uppercase tracking-widest">{locality}, {country}</div>
        <div className="text-base font-black text-white leading-tight mt-0.5">{raceName.replace(' Grand Prix', '')} <span className="text-[#ef4444]">Grand Prix</span></div>
        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{circuitName}</div>
      </div>

      {/* SVG Circuit Map */}
      <div className="flex-1 flex items-center justify-center px-4 py-2 relative">
        <div className="w-full h-full max-h-44 relative">
          <CircuitSVG raceName={raceName} />
          {/* Inactive overlay badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/90 border border-slate-700 rounded text-[9px] font-mono text-slate-400 uppercase tracking-widest">
            No Active Session
          </div>
        </div>
      </div>

      {/* Circuit stats */}
      <div className="grid grid-cols-3 border-t border-slate-800 divide-x divide-slate-800">
        {[
          { icon: Flag, label: 'Laps', value: raceName.includes('Monaco') ? '78' : '57' },
          { icon: Zap, label: 'Length', value: raceName.includes('Monaco') ? '3.337' : '5.303' },
          { icon: Clock, label: 'Turns', value: raceName.includes('Monaco') ? '19' : '16' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-2.5">
            <Icon className="w-3 h-3 text-slate-500 mb-1" />
            <div className="text-sm font-black text-white font-mono">{value}</div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTrackMapWidget;
