import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts';
import { Activity, Thermometer, Info, Sliders, AlertTriangle, Crosshair, ChevronRight, Zap } from 'lucide-react';

const generateTireData = (pitLap, tireCompound, degRates) => {
  const data = [];
  let grip = 100;
  
  let currentTire = 'Medium'; 
  
  for (let lap = 1; lap <= 57; lap++) {
    if (lap === pitLap) {
      grip = 100; // Pit stop, fresh tires
      currentTire = tireCompound;
    } else {
      const rate = degRates[currentTire] * (1 + (100 - grip) * 0.005);
      grip = Math.max(0, grip - rate);
    }
    
    data.push({
      lap,
      grip: Number(grip.toFixed(1)),
      tire: currentTire,
      timeLoss: Number(((100 - grip) * 0.04).toFixed(2)) // seconds lost per lap based on grip
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700 p-3 text-xs shadow-xl">
        <p className="text-white font-bold mb-1">Lap {label}</p>
        <p className="text-gray-300">Compound: <span className={data.tire === 'Soft' ? 'text-red-500' : data.tire === 'Medium' ? 'text-yellow-400' : 'text-gray-100'}>{data.tire}</span></p>
        <p className="text-gray-300">Grip: {data.grip}%</p>
        <p className="text-gray-300">Pace Drop: +{data.timeLoss}s</p>
      </div>
    );
  }
  return null;
};

const StrategyPage = () => {
  const [pitLap, setPitLap] = useState(18);
  const [targetTire, setTargetTire] = useState('Hard');
  const [safetyCarProb, setSafetyCarProb] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [liveGaps, setLiveGaps] = useState([]);
  const [sessionName, setSessionName] = useState('LIVE');
  const [fastF1Status, setFastF1Status] = useState('Syncing...');
  
  const [degRates, setDegRates] = useState({ Soft: 2.5, Medium: 1.2, Hard: 0.6 });

  // Fetch FastF1 Model
  useEffect(() => {
    fetch('http://localhost:5001/api/fastf1/tire_model')
      .then(res => res.json())
      .then(data => {
        if(data.degradation_model) {
          setDegRates(data.degradation_model);
          setSessionName(data.session);
          setFastF1Status('Connected');
        }
      })
      .catch(err => {
        console.error("FastF1 Error", err);
        setFastF1Status('Offline');
      });
  }, []);

  // Fetch OpenF1 Live Intervals & Drivers
  useEffect(() => {
    const fetchLiveTelemetry = async () => {
      try {
        // 1. Get Drivers map
        const driversRes = await fetch('https://api.openf1.org/v1/drivers?session_key=latest');
        const driversData = await driversRes.json();
        const driverMap = {};
        driversData.forEach(d => {
          driverMap[d.driver_number] = d;
        });

        // 2. Get latest Intervals
        const intervalsRes = await fetch('https://api.openf1.org/v1/intervals?session_key=latest');
        const intervalsData = await intervalsRes.json();
        
        // OpenF1 returns multiple updates per driver. We just want the latest for each driver.
        const latestGaps = {};
        intervalsData.forEach(record => {
           // Only track if gap is a number (sometimes it's "+1 LAP" or similar, we will handle numbers for bar chart)
           let gap = record.gap_to_leader;
           if (typeof gap === 'number' || gap === 0) {
             latestGaps[record.driver_number] = gap;
           } else if (typeof gap === 'string' && gap.includes('LAP')) {
             latestGaps[record.driver_number] = 99; // Arbitrary high number for visual
           }
        });

        // Sort and select top 5
        const sorted = Object.entries(latestGaps)
           .sort((a, b) => a[1] - b[1])
           .slice(0, 5)
           .map(([driverNum, gap]) => {
              const d = driverMap[driverNum];
              return {
                 lap: 'Live',
                 driver: d ? d.name_acronym : driverNum,
                 gap: gap === 99 ? '+1 LAP' : `+${gap.toFixed(3)}`,
                 delta: gap === 99 ? 10 : gap,
                 color: d ? `#${d.team_colour}` : '#ef4444'
              };
           });
        
        if (sorted.length > 0) setLiveGaps(sorted);
      } catch (err) {
        console.error("OpenF1 Error", err);
      }
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const tireData = useMemo(() => generateTireData(pitLap, targetTire, degRates), [pitLap, targetTire, degRates]);

  const projectedPosition = useMemo(() => {
    if (pitLap < 12) return "P6 (In Traffic)";
    if (pitLap >= 12 && pitLap <= 20) return "P2 (Clean Air)";
    return "P4 (Late Charger)";
  }, [pitLap]);

  const undercutDelta = pitLap >= 15 && pitLap <= 20 ? "-1.2s" : "+0.8s";
  
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert("Strategy exported! (Simulation of saving a screenshot to clipboard)");
      setIsExporting(false);
    }, 1500);
  };
  
  return (
    <div className="pt-2 pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-8 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter">
              Strategy <span className="text-red-600 font-bold italic">Lab.</span>
            </h1>
            <p className="mt-2 text-slate-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              FastF1 {fastF1Status} • Session: {sessionName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls & Insights */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Simulator Panel */}
          <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:bg-red-600/10"></div>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Sliders className="w-5 h-5 text-red-600" />
              Parameters
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pit Window (Lap)</label>
                  <span className="text-red-600 font-mono font-bold">{pitLap}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={pitLap}
                  onChange={(e) => setPitLap(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Target Compound</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Soft', 'Medium', 'Hard'].map(tire => (
                    <button
                      key={tire}
                      onClick={() => setTargetTire(tire)}
                      className={`py-2 text-xs font-bold uppercase transition-all border ${
                        targetTire === tire 
                          ? tire === 'Soft' ? 'bg-red-600/10 border-red-600 text-red-600' 
                            : tire === 'Medium' ? 'bg-yellow-400/10 border-yellow-400 text-yellow-500'
                            : 'bg-white/10 border-white text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {tire}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulate Safety Car</span>
                 <button 
                   onClick={() => setSafetyCarProb(!safetyCarProb)}
                   className={`w-12 h-6 rounded-full transition-colors relative ${safetyCarProb ? 'bg-yellow-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                 >
                   <motion.div 
                     className="w-4 h-4 bg-white rounded-full absolute top-1"
                     animate={{ left: safetyCarProb ? '26px' : '4px' }}
                   />
                 </button>
              </div>
            </div>
          </div>

          {/* AI Insight Layer */}
          <div className="bg-gradient-to-br from-slate-900 to-[#111] p-6 text-white border border-slate-800 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
             <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <Zap className="w-4 h-4" /> Pitwall Intelligence
             </h3>
             
             <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="p-3 bg-white/5 border border-white/10 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Undercut is highly powerful</p>
                    <p className="text-xs text-gray-400 mt-1">Pitting now gives a {undercutDelta} advantage over competitors on old mediums.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="p-3 bg-white/5 border border-white/10 flex items-start gap-3"
                >
                  <Crosshair className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Projected Outcome</p>
                    <p className="text-xs text-gray-400 mt-1">Re-joining in {projectedPosition}. Clear air expected for 4 laps.</p>
                  </div>
                </motion.div>
             </div>
          </div>

        </div>

        {/* Right Column: Charts & Data */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tire Life Model Chart */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Tire Degradation Model</h3>
                <p className="text-xs text-slate-500 tracking-widest mt-1">POWERED BY FASTF1</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400"></div> Med</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500"></div> Soft</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200"></div> Hard</span>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tireData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="lap" stroke="#666" tick={{fontSize: 10}} tickMargin={10} minTickGap={20} />
                  <YAxis stroke="#666" tick={{fontSize: 10}} domain={[0, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <ReferenceLine x={pitLap} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'PIT', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="grip" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGrip)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Head to Head Delta */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 p-6">
             <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight">Gap Delta vs Leader</h3>
                <p className="text-xs text-slate-500 tracking-widest mt-1">LIVE DATA VIA OPENF1</p>
              </div>
              {liveGaps.length > 0 && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
            </div>
            
            <div className="space-y-4">
               {liveGaps.length === 0 ? (
                 <div className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse py-8 text-center">Fetching live telemetry...</div>
               ) : liveGaps.map((d, i) => (
                 <div key={i} className="flex items-center gap-4 text-sm font-mono">
                   <div className="w-16 text-slate-500">{d.lap}</div>
                   <div className="w-10 font-bold">{d.driver}</div>
                   <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-900 relative rounded-sm overflow-hidden flex items-center">
                     <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${Math.max(2, Math.min(100, d.delta * 2))}%` }} 
                       transition={{ duration: 1, delay: i * 0.1 }}
                       className={`absolute left-0 h-full opacity-80`}
                       style={{ backgroundColor: d.color }}
                     />
                     <span className="relative z-10 pl-2 text-xs mix-blend-difference text-white">{d.gap}s</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Link to="/battle" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1">
                Full H2H Data <ChevronRight className="w-4 h-4" />
              </Link>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full" />
                    Generating Card...
                  </span>
                ) : (
                  "Share on X / Twitter"
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StrategyPage;
