import React, { useEffect, useState, useRef } from 'react';
import { Map } from 'lucide-react';

const LiveTrackMapWidget = () => {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const checkLiveSession = async () => {
      try {
        const res = await fetch('https://api.openf1.org/v1/sessions?session_key=latest');
        const data = await res.json();
        
        if (data && data.length > 0) {
          const session = data[0];
          const now = new Date();
          const startDate = new Date(session.date_start);
          const endDate = new Date(session.date_end);
          
          // Add a buffer of 2 hours after date_start if date_end is null or missing,
          // or just check if now is between start and end.
          const sessionEndTime = session.date_end ? endDate : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          
          if (now >= startDate && now <= sessionEndTime) {
            setIsLive(true);
            fetchLocations();
          } else {
            setIsLive(false);
            setLoading(false);
          }
        } else {
          setIsLive(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching OpenF1 session:", err);
        setIsLive(false);
        setLoading(false);
      }
    };

    const fetchLocations = async () => {
      try {
        // Just fetching a small subset to get the track shape or latest driver positions
        // In a real scenario, you'd filter by driver_number and get the latest
        const res = await fetch('https://api.openf1.org/v1/location?session_key=latest');
        const data = await res.json();
        
        // Take the last 1000 points to draw a rough map or driver positions
        const recentLocations = data.slice(-1000);
        setLocations(recentLocations);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching OpenF1 locations:", err);
        setLoading(false);
      }
    };

    checkLiveSession();
  }, []);

  useEffect(() => {
    if (isLive && locations.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Calculate min and max for scaling
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

      // Draw track path
      ctx.beginPath();
      ctx.strokeStyle = '#475569'; // slate-600
      ctx.lineWidth = 2;
      
      locations.forEach((loc, i) => {
        const cx = (loc.x - minX) * scale + offsetX;
        // Invert Y axis for canvas
        const cy = height - ((loc.y - minY) * scale + offsetY);
        
        if (i === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
      });
      ctx.stroke();
      
      // Draw a "live" blip for the latest position
      if (locations.length > 0) {
        const lastLoc = locations[locations.length - 1];
        const cx = (lastLoc.x - minX) * scale + offsetX;
        const cy = height - ((lastLoc.y - minY) * scale + offsetY);
        
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444'; // red-500
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();
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

  if (!isLive) {
    return null;
  }

  return (
    <div className="h-full flex flex-col pt-2 relative overflow-hidden bg-[#0a0a0a] border border-slate-800 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111]">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center relative">
               <Map className="w-4 h-4 text-white" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div>
               <div className="font-serif font-bold text-white tracking-tight">Live Track GPS</div>
               <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Telemetry Intercept</div>
            </div>
         </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 flex justify-center items-center p-4 relative">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={250} 
          className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        />
        
        <div className="absolute bottom-4 left-4 flex gap-2 items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-400">LIVE FEED</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackMapWidget;
