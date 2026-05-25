import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { getDriverImage } from '../utils/driverImages';
import { 
  Trophy, 
  Users, 
  Target, 
  Activity, 
  Copy, 
  Check, 
  Plus, 
  Sparkles, 
  Play, 
  AlertTriangle, 
  Clock, 
  Compass,
  Zap,
  Info,
  Calendar,
  CloudRain,
  ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DRIVERS = [
  { id: 'max_verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', number: '1', code: 'VER', teamColor: '#3671C6' },
  { id: 'norris', name: 'Lando Norris', team: 'McLaren', number: '4', code: 'NOR', teamColor: '#FF8700' },
  { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', number: '16', code: 'LEC', teamColor: '#E80020' },
  { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren', number: '81', code: 'PIA', teamColor: '#FF8700' },
  { id: 'sainz', name: 'Carlos Sainz', team: 'Ferrari', number: '55', code: 'SAI', teamColor: '#E80020' },
  { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari', number: '44', code: 'HAM', teamColor: '#E80020' },
  { id: 'russell', name: 'George Russell', team: 'Mercedes', number: '63', code: 'RUS', teamColor: '#27F4D2' },
  { id: 'perez', name: 'Sergio Perez', team: 'Red Bull Racing', number: '11', code: 'PER', teamColor: '#3671C6' },
  { id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin', number: '14', code: 'ALO', teamColor: '#229971' },
  { id: 'tsunoda', name: 'Yuki Tsunoda', team: 'RB', number: '22', code: 'TSU', teamColor: '#6692FF' },
  { id: 'albon', name: 'Alex Albon', team: 'Williams', number: '23', code: 'ALB', teamColor: '#64C4FF' },
  { id: 'gasly', name: 'Pierre Gasly', team: 'Alpine', number: '10', code: 'GAS', teamColor: '#FF87BC' },
  { id: 'ocon', name: 'Esteban Ocon', team: 'Haas', number: '31', code: 'OCO', teamColor: '#B6BABD' },
  { id: 'hulkenberg', name: 'Nico Hulkenberg', team: 'Kick Sauber', number: '27', code: 'HUL', teamColor: '#52E252' },
  { id: 'stroll', name: 'Lance Stroll', team: 'Aston Martin', number: '18', code: 'STR', teamColor: '#229971' },
  { id: 'magnussen', name: 'Kevin Magnussen', team: 'Haas', number: '20', code: 'MAG', teamColor: '#B6BABD' },
  { id: 'bottas', name: 'Valtteri Bottas', team: 'Kick Sauber', number: '77', code: 'BOT', teamColor: '#52E252' },
  { id: 'zhou', name: 'Guanyu Zhou', team: 'Kick Sauber', number: '24', code: 'ZHO', teamColor: '#52E252' }
];

const CIRCUIT_MOCK_METADATA = {
  monaco: { laps: 78, length: '3.337 km', record: '1:12.909 (Hamilton)', tire: 'C3 / C4 / C5 (Softest)' },
  monza: { laps: 53, length: '5.793 km', record: '1:18.887 (Hamilton)', tire: 'C3 / C4 / C5' },
  spa: { laps: 44, length: '7.004 km', record: '1:46.286 (Bottas)', tire: 'C2 / C3 / C4' },
  silverstone: { laps: 52, length: '5.891 km', record: '1:27.097 (Verstappen)', tire: 'C1 / C2 / C3 (Hardest)' },
  suzuka: { laps: 53, length: '5.807 km', record: '1:30.983 (Hamilton)', tire: 'C1 / C2 / C3' },
  bahrain: { laps: 57, length: '5.412 km', record: '1:31.447 (de la Rosa)', tire: 'C1 / C2 / C3' },
  jeddah: { laps: 50, length: '6.174 km', record: '1:30.734 (Hamilton)', tire: 'C2 / C3 / C4' },
  melbourne: { laps: 58, length: '5.278 km', record: '1:19.813 (Leclerc)', tire: 'C3 / C4 / C5' },
  shanghai: { laps: 56, length: '5.451 km', record: '1:32.238 (Schumacher)', tire: 'C2 / C3 / C4' },
  miami: { laps: 57, length: '5.412 km', record: '1:29.708 (Verstappen)', tire: 'C2 / C3 / C4' },
  imola: { laps: 63, length: '4.909 km', record: '1:15.484 (Hamilton)', tire: 'C3 / C4 / C5' },
  catalunya: { laps: 66, length: '4.657 km', record: '1:18.149 (Verstappen)', tire: 'C1 / C2 / C3' },
  hungaroring: { laps: 70, length: '4.381 km', record: '1:16.627 (Hamilton)', tire: 'C3 / C4 / C5' },
  zandvoort: { laps: 72, length: '4.259 km', record: '1:11.097 (Hamilton)', tire: 'C1 / C2 / C3' },
  baku: { laps: 51, length: '6.003 km', record: '1:43.009 (Leclerc)', tire: 'C3 / C4 / C5' },
  marina_bay: { laps: 62, length: '4.940 km', record: '1:35.867 (Hamilton)', tire: 'C3 / C4 / C5' },
  austin: { laps: 56, length: '5.513 km', record: '1:36.169 (Leclerc)', tire: 'C2 / C3 / C4' },
  rodriguez: { laps: 71, length: '4.304 km', record: '1:17.774 (Bottas)', tire: 'C3 / C4 / C5' },
  interlagos: { laps: 71, length: '4.309 km', record: '1:10.540 (Bottas)', tire: 'C3 / C4 / C5' },
  las_vegas: { laps: 50, length: '6.201 km', record: '1:35.490 (Piastri)', tire: 'C3 / C4 / C5' },
  losail: { laps: 57, length: '5.419 km', record: '1:24.319 (Verstappen)', tire: 'C1 / C2 / C3' },
  yas_marina: { laps: 58, length: '5.281 km', record: '1:26.103 (Verstappen)', tire: 'C3 / C4 / C5' }
};

const FantasyPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tabs
  const [activeTab, setActiveTab] = useState('predictions'); // 'predictions' | 'battles'

  // Race Calendar state
  const [races, setRaces] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentRaceName, setCurrentRaceName] = useState('Monaco Grand Prix');
  const [currentCircuitId, setCurrentCircuitId] = useState('monaco');
  const [calendarLoading, setCalendarLoading] = useState(true);

  // Predictions state
  const [prediction, setPrediction] = useState({ winner: '', pole: '', fastestLap: '' });
  const [predLoading, setPredLoading] = useState(false);
  const [predSuccess, setPredSuccess] = useState('');
  const [predError, setPredError] = useState('');

  // Battles / Leagues state
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [leagueDetailsLoading, setLeagueDetailsLoading] = useState(false);
  
  // Create / Join inputs
  const [newLeagueName, setNewLeagueName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [battleSuccess, setBattleSuccess] = useState('');
  const [battleError, setBattleError] = useState('');

  // Bot inviter state
  const [showAddBot, setShowAddBot] = useState(false);
  const [botName, setBotName] = useState('');
  const [botStrategy, setBotStrategy] = useState('random');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLights, setSimulationLights] = useState(0); // 0 to 5, then -1 (lights out)
  const [simResults, setSimResults] = useState(null);

  // UI state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 1. Fetch race calendar on mount
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await fetch('https://api.jolpi.ca/ergast/f1/current.json');
        const data = await res.json();
        const raceList = data.MRData.RaceTable.Races;
        setRaces(raceList);
        
        // Find next/current race
        const now = new Date();
        const upcoming = raceList.find(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          return raceDate > now;
        });
        
        const activeRace = upcoming || raceList[raceList.length - 1];
        if (activeRace) {
          setCurrentRound(parseInt(activeRace.round));
          setCurrentRaceName(activeRace.raceName);
          setCurrentCircuitId(activeRace.Circuit.circuitId);
        }
      } catch (err) {
        console.error("Error fetching F1 calendar", err);
      } finally {
        setCalendarLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // 2. Fetch predictions for current round
  useEffect(() => {
    if (!token || calendarLoading) return;
    
    const fetchPredictions = async () => {
      setPredLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/fantasy/predictions/${currentRound}`, axiosConfig);
        if (res.data) {
          setPrediction({
            winner: res.data.winner || '',
            pole: res.data.pole || '',
            fastestLap: res.data.fastestLap || ''
          });
        }
      } catch (err) {
        console.error("Failed to load predictions", err);
      } finally {
        setPredLoading(false);
      }
    };
    fetchPredictions();
  }, [currentRound, calendarLoading, token]);

  // 3. Fetch all leagues
  useEffect(() => {
    if (!token) return;
    fetchLeagues();
  }, [token]);

  // 4. Handle invite link parameter (?join=PIT-XXXX)
  useEffect(() => {
    const joinCode = searchParams.get('join');
    if (joinCode) {
      setActiveTab('battles');
      setInviteCodeInput(joinCode.toUpperCase());
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchLeagues = async () => {
    setLeaguesLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/fantasy/leagues`, axiosConfig);
      setLeagues(res.data);
      
      if (selectedLeague) {
        const updated = res.data.find(l => l.id === selectedLeague.id);
        if (updated) setSelectedLeague(updated);
      }
    } catch (err) {
      console.error("Failed to fetch leagues", err);
    } finally {
      setLeaguesLoading(false);
    }
  };

  const selectLeague = async (leagueId) => {
    setLeagueDetailsLoading(true);
    setSimResults(null);
    try {
      const res = await axios.get(`${API_URL}/api/fantasy/leagues/${leagueId}`, axiosConfig);
      setSelectedLeague(res.data);
    } catch (err) {
      console.error("Failed to fetch league details", err);
    } finally {
      setLeagueDetailsLoading(false);
    }
  };

  const handleSavePrediction = async (e) => {
    e.preventDefault();
    setPredSuccess('');
    setPredError('');
    
    if (!prediction.winner || !prediction.pole || !prediction.fastestLap) {
      setPredError('Select options for Winner, Pole, and Fastest Lap to sync with telemetry.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/fantasy/predictions/${currentRound}`, prediction, axiosConfig);
      setPredSuccess(res.data.msg);
    } catch (err) {
      setPredError(err.response?.data?.msg || 'Failed to lock predictions.');
    }
  };

  const handleCreateLeague = async (e) => {
    e.preventDefault();
    setBattleSuccess('');
    setBattleError('');

    if (!newLeagueName.trim()) {
      setBattleError('Enter a league title.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/fantasy/leagues/create`, { name: newLeagueName }, axiosConfig);
      setBattleSuccess(res.data.msg);
      setNewLeagueName('');
      await fetchLeagues();
      if (res.data.league) {
        setSelectedLeague(res.data.league);
      }
    } catch (err) {
      setBattleError(err.response?.data?.msg || 'Failed to configure league.');
    }
  };

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    setBattleSuccess('');
    setBattleError('');

    if (!inviteCodeInput.trim()) {
      setBattleError('Enter your invite code.');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/fantasy/leagues/join`, { inviteCode: inviteCodeInput }, axiosConfig);
      setBattleSuccess(res.data.msg);
      setInviteCodeInput('');
      await fetchLeagues();
      if (res.data.league) {
        setSelectedLeague(res.data.league);
      }
    } catch (err) {
      setBattleError(err.response?.data?.msg || 'Failed to authenticate invite.');
    }
  };

  const handleAddBot = async (e) => {
    e.preventDefault();
    if (!selectedLeague) return;
    
    try {
      const res = await axios.post(
        `${API_URL}/api/fantasy/leagues/${selectedLeague.id}/invite-bot`, 
        { botName, botStrategy }, 
        axiosConfig
      );
      setSelectedLeague(res.data.league);
      setShowAddBot(false);
      setBotName('');
      setBotStrategy('random');
      await fetchLeagues();
    } catch (err) {
      alert(err.response?.data?.msg || 'Grid placement rejected.');
    }
  };

  const triggerRaceSimulation = async () => {
    if (!selectedLeague) return;
    setSimResults(null);
    setIsSimulating(true);
    setSimulationLights(0);

    let lights = 0;
    const interval = setInterval(() => {
      lights += 1;
      setSimulationLights(lights);
      if (lights === 5) {
        clearInterval(interval);
        setTimeout(async () => {
          setSimulationLights(-1);
          
          try {
            const res = await axios.post(
              `${API_URL}/api/fantasy/leagues/${selectedLeague.id}/simulate-race`,
              { round: currentRound, raceName: currentRaceName },
              axiosConfig
            );
            
            setTimeout(() => {
              setSimResults(res.data);
              setSelectedLeague(res.data.league);
              setIsSimulating(false);
              fetchLeagues();
            }, 1200);

          } catch (err) {
            alert(err.response?.data?.msg || 'Telemetry loop dropped.');
            setIsSimulating(false);
          }
        }, 1000 + Math.random() * 1200);
      }
    }, 450);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getDriverDetails = (id) => {
    return DRIVERS.find(d => d.id === id) || { name: id, team: 'F1 Competitor', number: '00', code: 'DRV', teamColor: '#64748b' };
  };

  const activeMetadata = CIRCUIT_MOCK_METADATA[currentCircuitId] || { laps: 55, length: '5.2 km', record: '1:35.000', tire: 'C2 / C3 / C4' };

  return (
    <div className="pt-2 pb-20">
      {/* Dynamic F1 Telemetry Top Banner */}
      <div className="w-[100vw] relative left-1/2 -translate-x-1/2 bg-slate-900 text-white overflow-hidden py-1 mb-8 border-y border-red-600/50">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="animate-ticker flex items-center space-x-12 text-[10px] font-mono tracking-widest shrink-0 px-4">
            <span className="text-red-500 font-bold">F1 COMMAND CENTRE</span>
            <span>•</span>
            <span>SIMULATION PIPELINE: ONLINE</span>
            <span>•</span>
            <span className="text-yellow-400">ACTIVE: {currentRaceName.toUpperCase()}</span>
            <span>•</span>
            <span>LAP COUNT: {activeMetadata.laps} LAPS</span>
            <span>•</span>
            <span>DRS REGION: AUTO-DETERMINED</span>
            <span>•</span>
            <span className="text-red-500 font-bold">PIT DEEP COUPLING ACTIVE</span>
          </div>
          <div className="animate-ticker flex items-center space-x-12 text-[10px] font-mono tracking-widest shrink-0 px-4" aria-hidden>
            <span className="text-red-500 font-bold">F1 COMMAND CENTRE</span>
            <span>•</span>
            <span>SIMULATION PIPELINE: ONLINE</span>
            <span>•</span>
            <span className="text-yellow-400">ACTIVE: {currentRaceName.toUpperCase()}</span>
            <span>•</span>
            <span>LAP COUNT: {activeMetadata.laps} LAPS</span>
            <span>•</span>
            <span>DRS REGION: AUTO-DETERMINED</span>
            <span>•</span>
            <span className="text-red-500 font-bold">PIT DEEP COUPLING ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Styled F1 Header (Slanted Slits and Red Accents) */}
      <div className="mb-10 border-b-[3px] border-slate-900 dark:border-white pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-1 bg-red-600 inline-block -skew-x-12"></span>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-600 dark:text-red-500">
              BOX BOX CLASH SYSTEM
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white capitalize tracking-tighter leading-none">
            Grand Prix <span className="text-red-600 font-bold italic">Predictions.</span>
          </h1>
        </div>

        {/* Tab Selector - Slate Skewed F1 Buttons */}
        <div className="flex bg-slate-200/60 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-300 dark:border-slate-800 shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex items-center gap-2 py-2 px-4 rounded transition-all duration-300 ${activeTab === 'predictions' ? 'bg-red-600 text-white font-bold shadow-md -skew-x-12' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
          >
            <Target className="w-3.5 h-3.5" />
            <span className="skew-x-12">PREDICT</span>
          </button>
          <button
            onClick={() => setActiveTab('battles')}
            className={`flex items-center gap-2 py-2 px-4 rounded transition-all duration-300 ${activeTab === 'battles' ? 'bg-red-600 text-white font-bold shadow-md -skew-x-12' : 'text-slate-500 hover:text-slate-950 dark:hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="skew-x-12">BATTLES</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Predictions */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Grid: Card Selection */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* GP Telemetry Badge Card */}
            <div className="glass-panel p-6 bg-gradient-to-r from-slate-950 to-slate-900 border-l-4 border-l-red-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, transparent 1px, transparent 10px, #fff 11px)' }}></div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-black">active grand prix hub</span>
                <h3 className="text-3xl font-serif font-bold tracking-tight mt-1">{currentRaceName}</h3>
                <p className="text-slate-400 text-xs mt-1.5 font-mono flex items-center gap-3">
                  <span>ROUND {String(currentRound).padStart(2, '0')}</span>
                  <span>|</span>
                  <span>CIRCUIT: {currentCircuitId.toUpperCase()}</span>
                </p>
              </div>

              {/* HUD statistics block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 font-mono text-[10px] text-slate-400 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                <div>
                  <span className="block text-slate-500 uppercase">Laps</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{activeMetadata.laps} LAPS</span>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase">Length</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{activeMetadata.length}</span>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase">Lap Record</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{activeMetadata.record}</span>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase">Tire Spec</span>
                  <span className="text-xs font-bold text-yellow-400 mt-0.5 block">{activeMetadata.tire}</span>
                </div>
              </div>
            </div>

            {/* Error / Success Banners */}
            {predSuccess && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2 shadow-lg animate-fadeIn font-mono">
                <Check className="w-4 h-4 shrink-0" />
                {predSuccess.toUpperCase()}
              </div>
            )}
            {predError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2 shadow-lg animate-fadeIn font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {predError.toUpperCase()}
              </div>
            )}

            {predLoading ? (
              <div className="py-24 text-center font-mono text-xs text-slate-500 animate-pulse uppercase tracking-widest">
                ⚙️ Synchronizing driver registry and telemetry...
              </div>
            ) : (
              <form onSubmit={handleSavePrediction} className="space-y-6">
                
                {/* 3D DRIVER CARDS SELECTION LOOP */}
                {[
                  { key: 'winner', label: 'Race Winner Prediction', points: 'Winner: +25pts' },
                  { key: 'pole', label: 'Pole Position Prediction', points: 'Pole: +15pts' },
                  { key: 'fastestLap', label: 'Fastest Lap Prediction', points: 'Fastest Lap: +10pts' }
                ].map((category) => {
                  const selectedId = prediction[category.key];
                  const d = selectedId ? getDriverDetails(selectedId) : null;
                  
                  return (
                    <div 
                      key={category.key}
                      style={{ 
                        borderLeftColor: d ? d.teamColor : 'transparent',
                        boxShadow: d ? `inset 0 0 20px -5px ${d.teamColor}20, 0 10px 30px -15px ${d.teamColor}30` : 'none' 
                      }}
                      className="glass-panel p-5 relative overflow-hidden transition-all duration-300 border-l-4 hover:border-slate-400 dark:hover:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-950/80 min-h-[140px] flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                      {/* Driver number watermark behind */}
                      {d && (
                        <div 
                          style={{ color: `${d.teamColor}08` }}
                          className="absolute right-4 bottom-2 text-9xl font-black font-mono leading-none z-0 pointer-events-none select-none"
                        >
                          {d.number}
                        </div>
                      )}

                      {/* Header details inside card */}
                      <div className="relative z-10 w-full md:w-5/12 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                          <img 
                            src={getDriverImage(d ? d.name : '')} 
                            alt={category.label}
                            className={`w-full h-full object-cover mt-2 scale-[1.3] transition-opacity duration-300 ${d ? 'opacity-100' : 'opacity-10'}`} 
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-red-500 uppercase">{category.points}</span>
                          <h4 className="text-base font-serif font-bold text-slate-900 dark:text-white leading-tight mt-0.5">{category.label}</h4>
                          <p className="text-[10px] text-slate-500 font-mono tracking-wide mt-1">
                            {d ? `${d.team.toUpperCase()} • NO. ${d.number}` : 'AWAITING LOCK IN'}
                          </p>
                        </div>
                      </div>

                      {/* Selection dropdown inside card */}
                      <div className="relative z-10 w-full md:w-5/12 flex items-center gap-2">
                        <select
                          value={selectedId}
                          onChange={e => setPrediction(prev => ({ ...prev, [category.key]: e.target.value }))}
                          className="input-field py-2 text-xs font-mono border-slate-200 dark:border-slate-800 dark:bg-black/40"
                        >
                          <option value="">-- SELECT CONSTRUCTOR DRIVER --</option>
                          {DRIVERS.map(drv => (
                            <option key={drv.id} value={drv.id}>{drv.name} ({drv.code}) - {drv.team}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}

                <button 
                  type="submit" 
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 group transition-all duration-300 rounded-lg -skew-x-12"
                >
                  <Trophy className="w-4 h-4 text-white transition-transform group-hover:-translate-y-0.5 skew-x-12" />
                  <span className="skew-x-12">Engage Core Predictions</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Rules & Interactive Calendar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Premium FIA Formula Flag Rules Widget */}
            <div className="glass-panel p-6 bg-gradient-to-b from-slate-950 to-slate-900 text-white border-t-4 border-t-yellow-500">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
                <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest">CLASH REGULATIONS</h4>
              </div>
              
              <div className="space-y-4 text-[11px] leading-relaxed">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-center text-yellow-500 shrink-0 font-mono font-bold">1</div>
                  <p className="text-slate-300">Predictions must be locked in prior to Grand Prix race simulation to calculate points.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-center text-yellow-500 shrink-0 font-mono font-bold">2</div>
                  <p className="text-slate-300">Correctly chosen Winner nets <strong>25 points</strong>. Pole earns <strong>15 points</strong>. Fastest Lap earns <strong>10 points</strong>.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-center justify-center text-yellow-500 shrink-0 font-mono font-bold">3</div>
                  <p className="text-slate-300">Run a simulated race in the <strong>Battles</strong> tab to watch points tally change live against friends and bots.</p>
                </div>
              </div>
            </div>

            {/* F1 Skewed Season Grid list */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-red-600" />
                <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">2026 CALENDAR REGISTRY</h4>
              </div>
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scroll-styling font-mono text-xs">
                {calendarLoading ? (
                  <div className="text-slate-500 text-center py-6 animate-pulse uppercase">Syncing FIA Stream...</div>
                ) : (
                  races.map((r) => {
                    const isSelected = parseInt(r.round) === currentRound;
                    const rDate = new Date(r.date);
                    return (
                      <button 
                        key={r.round}
                        onClick={() => {
                          setCurrentRound(parseInt(r.round));
                          setCurrentRaceName(r.raceName);
                          setCurrentCircuitId(r.Circuit.circuitId);
                        }}
                        className={`w-full p-2.5 rounded border transition-all flex items-center justify-between text-left ${
                          isSelected 
                            ? 'bg-red-600 border-red-600 text-white font-bold -skew-x-6' 
                            : 'bg-transparent border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            R{String(r.round).padStart(2, '0')}
                          </span>
                          <div>
                            <div className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-slate-900 dark:text-slate-300'}`}>{r.Circuit.Location.locality.toUpperCase()}</div>
                            <div className={`text-[9px] ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>{r.raceName}</div>
                          </div>
                        </div>
                        <div className="text-right text-[10px]">
                          {rDate.toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Battles */}
      {activeTab === 'battles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Side panel: Active Battles list */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Create & Join forms */}
            <div className="glass-panel p-6 space-y-6 bg-slate-50/80 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Zap className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">LEAGUE DECK</h4>
              </div>

              {battleSuccess && (
                <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono uppercase">
                  {battleSuccess}
                </div>
              )}
              {battleError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono uppercase">
                  {battleError}
                </div>
              )}

              {/* Create */}
              <form onSubmit={handleCreateLeague} className="space-y-2">
                <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block">CREATE NEW LEAGUE</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLeagueName}
                    onChange={e => setNewLeagueName(e.target.value)}
                    placeholder="League Title..."
                    className="input-field py-2 text-xs font-mono border-slate-200 dark:border-slate-800"
                  />
                  <button type="submit" className="primary-button px-3 shrink-0 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Join */}
              <form onSubmit={handleJoinLeague} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block">JOIN LEAGUE WITH CODE</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={e => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. PIT-8X2F"
                    className="input-field py-2 text-xs font-mono border-slate-200 dark:border-slate-800"
                  />
                  <button type="submit" className="primary-button px-3 shrink-0 font-mono font-bold text-xs uppercase tracking-widest">
                    JOIN
                  </button>
                </div>
              </form>
            </div>

            {/* List of user's active Leagues */}
            <div className="glass-panel p-6 space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">ACTIVE BATTLES DECK</h4>
              {leaguesLoading ? (
                <div className="text-center font-mono text-xs text-slate-500 py-6 animate-pulse uppercase">Syncing grid records...</div>
              ) : leagues.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-300 dark:text-white/10 mx-auto mb-3 opacity-30" />
                  <p className="text-slate-500 text-xs font-mono">NO LEAGUES ASSOCIATED</p>
                  <p className="text-slate-400 text-[9px] font-mono mt-1">Configure one above to lock grid positions.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leagues.map(l => {
                    const isSelected = selectedLeague?.id === l.id;
                    const membersCount = l.members.length;
                    const userPosition = l.members
                      .slice()
                      .sort((a, b) => b.points - a.points)
                      .findIndex(m => m.userId === user?.id) + 1;

                    return (
                      <button
                        key={l.id}
                        onClick={() => selectLeague(l.id)}
                        className={`w-full p-3 border transition-all text-left flex items-center justify-between ${
                          isSelected 
                            ? 'bg-slate-950 border-red-600 text-white shadow-lg -skew-x-6' 
                            : 'bg-transparent border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold font-mono tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                            {l.name.toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-mono">
                            <span>{membersCount} GRID ENTRANTS</span>
                            <span>•</span>
                            <span className="text-red-500 font-bold">{l.inviteCode}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 py-1 px-1.5 rounded text-slate-600 dark:text-slate-300">
                            P{userPosition || '-'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Active League Dashboard */}
          <div className="lg:col-span-8">
            {leagueDetailsLoading ? (
              <div className="glass-panel p-16 text-center font-mono text-xs text-slate-500 animate-pulse h-full flex items-center justify-center uppercase tracking-widest">
                ⚙️ Fetching pitwall telemetry from cloud server...
              </div>
            ) : !selectedLeague ? (
              <div className="glass-panel p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Users className="w-16 h-16 text-slate-300 dark:text-white/10 mb-4 animate-pulse" />
                <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">No Battle Selected</h3>
                <p className="text-slate-500 text-xs font-mono max-w-sm mb-6">
                  SELECT OR INITIALIZE A CLASH LEAGUE DECK FROM THE LEFT BAR TO ENGAGE TELEMETRY BATTLES.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* League Header Card */}
                <div className="glass-panel p-6 md:p-8 bg-gradient-to-r from-slate-950 to-slate-900 border-l-4 border-l-red-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, transparent 1px, transparent 10px, #fff 11px)' }}></div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-mono tracking-widest text-red-500 uppercase font-black">clash squad telemetry</span>
                    <h3 className="text-3xl font-serif font-bold tracking-tight mt-1">{selectedLeague.name}</h3>
                    <p className="text-slate-400 text-xs mt-1.5 font-mono">
                      HOSTED BY: {selectedLeague.creatorId === user?.id ? 'YOU' : 'OTHER STRATEGIST'} • CREATED {new Date(selectedLeague.createdAt).toLocaleDateString().toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Share code gantry badge */}
                  <div className="flex flex-col gap-2 relative z-10 w-full md:w-auto shrink-0 font-mono text-xs">
                    <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded border border-white/10">
                      <div>
                        <div className="text-[8px] text-slate-400 uppercase tracking-widest">INVITE CODE</div>
                        <div className="text-sm font-bold text-red-500 tracking-wider">{selectedLeague.inviteCode}</div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(selectedLeague.inviteCode, 'code')}
                        className="p-1.5 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-red-500"
                        title="Copy Code"
                      >
                        {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}/fantasy?join=${selectedLeague.inviteCode}`, 'link')}
                      className="text-[9px] font-bold text-slate-400 hover:text-red-500 flex items-center justify-center gap-1.5 py-1 transition-colors uppercase"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-green-500">LINK REPLICATED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY DIRECT JOIN LINK</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* FIA COUNTDOWN GANTRY SIMULATOR */}
                {isSimulating && (
                  <div className="glass-panel p-8 bg-black/95 text-white flex flex-col items-center justify-center min-h-[340px] text-center border-2 border-red-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, transparent 1px, transparent 10px, #fff 11px)' }}></div>
                    
                    <div className="text-red-600 text-xs font-mono font-bold tracking-widest mb-4 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                      <span>FIA Start Gantry Telemetry</span>
                    </div>
                    <div className="text-xl font-mono mb-8 uppercase tracking-wide">
                      Simulating: <span className="text-yellow-400 font-bold">{currentRaceName.toUpperCase()}</span>
                    </div>
                    
                    {/* Metal Gantry Gantry Bar */}
                    <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 p-4 rounded-xl border border-zinc-700 shadow-2xl relative">
                      {/* Top metal bar */}
                      <div className="absolute top-[-8px] left-0 right-0 h-2 bg-zinc-950 border-b border-zinc-800"></div>
                      
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((lightIndex) => {
                          const isLit = simulationLights >= lightIndex;
                          const isOff = simulationLights === -1;
                          return (
                            <div key={lightIndex} className="flex flex-col items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                              {/* Glowing LED array bubble */}
                              <div className="w-8 h-8 rounded-full border border-black bg-zinc-900 flex flex-col gap-1 py-1 justify-center">
                                {[1, 2].map(dot => (
                                  <div 
                                    key={dot}
                                    className={`w-2.5 h-2.5 rounded-full mx-auto transition-all duration-100 ${
                                      isOff ? 'bg-zinc-800' :
                                      isLit ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,1)] animate-pulse' : 'bg-zinc-950'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono tracking-widest text-slate-400 animate-pulse mt-8 uppercase">
                      {simulationLights === 0 && "SYNCHRONIZING ENGINE THROTTLES..."}
                      {simulationLights > 0 && simulationLights < 5 && `ARMING RED SECTORS [STAGE ${simulationLights}/5]...`}
                      {simulationLights === 5 && "ALL SYSTEMS ARMED. STAND BY FOR START..."}
                      {simulationLights === -1 && <span className="text-green-500 font-bold text-sm">LIGHTS OUT! AND AWAY WE GO!</span>}
                    </div>
                  </div>
                )}

                {/* Simulated Race Report Card */}
                {simResults && !isSimulating && (
                  <div className="glass-panel p-6 border-2 border-green-500 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-fadeIn">
                    <div className="flex items-center gap-2 text-green-500 text-xs font-mono font-bold tracking-widest mb-4">
                      <Sparkles className="w-4 h-4 text-green-500 animate-bounce" />
                      <span>RACE SIMULATION REPORT REGISTERED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-100 dark:bg-black/30 p-4 rounded-lg border border-slate-200 dark:border-white/10 text-center font-mono">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest">Pole Position</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {simResults.results.pole.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-center relative overflow-hidden font-mono">
                        <div className="absolute top-1 right-1"><Trophy className="w-3.5 h-3.5 text-red-500 opacity-30" /></div>
                        <div className="text-[9px] text-red-500 uppercase tracking-widest font-black">RACE WINNER</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                          {simResults.results.winner.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-black/30 p-4 rounded-lg border border-slate-200 dark:border-white/10 text-center font-mono">
                        <div className="text-[9px] text-slate-400 uppercase tracking-widest">Fastest Lap</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {simResults.results.fastestLap.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Live Commentary Feed */}
                    {simResults.commentary && simResults.commentary.length > 0 && (
                      <div className="mb-6 bg-black/60 p-4 border border-zinc-800 rounded font-mono text-xs text-slate-300 space-y-2">
                        <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          Race Commentary Feed
                        </div>
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 scroll-styling text-left">
                          {simResults.commentary.map((line, lIdx) => (
                            <div key={lIdx} className="border-l border-red-650 pl-3 py-1 font-mono text-[11px] text-slate-300">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Points distribution list */}
                    <div>
                      <h4 className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-3">POINTS DISTRIBUTION</h4>
                      <div className="space-y-2 font-mono text-xs">
                        {simResults.pointsAwarded.map((pa, idx) => (
                          <div key={pa.userId} className="flex justify-between items-center bg-white dark:bg-white/5 p-3 rounded border border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-bold">{idx + 1}.</span>
                              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase">{pa.displayName}</span>
                              {pa.prediction ? (
                                <span className="text-[10px] text-slate-400 hidden sm:inline">
                                  (WINNER: {pa.prediction.winner.split(' ').pop()} | POLE: {pa.prediction.pole.split(' ').pop()})
                                </span>
                              ) : (
                                <span className="text-[9px] text-red-500 font-bold uppercase">No Predictions Logged</span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-green-500">+{pa.pointsEarned} PTS</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setSimResults(null)} 
                      className="mt-5 w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 rounded font-mono font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Sync Board & Dismiss Report
                    </button>
                  </div>
                )}

                {/* Standings Grid Board (F1 Broadcast styling) */}
                <div className="glass-panel p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className="text-xl font-serif font-bold text-slate-900 dark:text-white">Clash standings board</h4>
                      <p className="text-slate-400 text-xs font-mono mt-1">LEAGUE GRID TELEMETRY UPDATED DYNAMICALLY.</p>
                    </div>

                    {/* Simulation & Bot controls */}
                    <div className="flex gap-2 shrink-0 font-mono text-xs">
                      {selectedLeague.creatorId === user?.id ? (
                        <>
                          <button
                            onClick={() => setShowAddBot(prev => !prev)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest rounded transition-all"
                          >
                            Add Bot
                          </button>
                          
                          <button
                            onClick={triggerRaceSimulation}
                            disabled={isSimulating}
                            className="primary-button py-2 px-3.5 flex items-center gap-1.5 font-bold uppercase tracking-widest -skew-x-12"
                          >
                            <Play className="w-3.5 h-3.5 fill-white text-white skew-x-12" />
                            <span className="skew-x-12">Simulate GP</span>
                          </button>
                        </>
                      ) : (
                        <div className="text-[9px] font-mono text-slate-500 flex items-center gap-2 bg-slate-100 dark:bg-black/20 py-2 px-4 rounded border border-slate-200 dark:border-slate-800">
                          <Clock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          <span>AWAITING GRID HOST SIMULATION</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Bot Challenger Form */}
                  {showAddBot && (
                    <form onSubmit={handleAddBot} className="mb-6 p-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 animate-fadeIn">
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">INVITE AI CHALLENGER</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Challenger Nickname</label>
                          <input 
                            type="text" 
                            value={botName}
                            onChange={e => setBotName(e.target.value)}
                            placeholder="e.g. Papaya Beast AI"
                            required
                            className="input-field py-2 text-xs font-mono border-slate-200 dark:border-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Predictive Strategy Bias</label>
                          <select 
                            value={botStrategy}
                            onChange={e => setBotStrategy(e.target.value)}
                            className="input-field py-2 text-xs font-mono border-slate-200 dark:border-slate-800 dark:bg-black"
                          >
                            <option value="toto">Toto Wolff Strategy (Mercedes Bias)</option>
                            <option value="christian">Christian Horner Strategy (Red Bull Bias)</option>
                            <option value="gunther">Günther Steiner Strategy (Midfield/Chaotic)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end font-mono text-[10px]">
                        <button 
                          type="button" 
                          onClick={() => setShowAddBot(false)}
                          className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white uppercase"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="primary-button py-1.5 px-3 uppercase font-bold"
                        >
                          Place Bot on Grid
                        </button>
                      </div>
                    </form>
                  )}

                  {/* F1 Standings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] tracking-widest text-slate-400 uppercase">
                          <th className="py-3 px-2 text-center w-12">Pos</th>
                          <th className="py-3 px-4">Driver / Clasher</th>
                          <th className="py-3 px-4 hidden sm:table-cell">Role</th>
                          <th className="py-3 px-4 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLeague.members
                          .slice()
                          .sort((a, b) => b.points - a.points)
                          .map((member, idx) => {
                            const isMe = member.userId === user?.id;
                            const isHost = member.isHost || member.userId === selectedLeague.creatorId;

                            return (
                              <tr 
                                key={member.userId} 
                                className={`border-b border-slate-100 dark:border-white/5 transition-colors ${isMe ? 'bg-red-500/10 font-bold text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-300'}`}
                              >
                                {/* Position badge styled like F1 broadcast standing indicator */}
                                <td className="py-4 px-2 text-center">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] mx-auto ${
                                    idx === 0 ? 'bg-yellow-500 text-black' :
                                    idx === 1 ? 'bg-slate-300 text-black' :
                                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase">{member.displayName}</span>
                                    {isMe && <span className="text-[8px] border border-red-500/60 text-red-500 py-0.5 px-1 rounded uppercase tracking-widest font-black">YOU</span>}
                                    {member.isBot && <span className="text-[8px] bg-blue-500/10 text-blue-500 border border-blue-500/20 py-0.5 px-1 rounded uppercase">AI</span>}
                                  </div>
                                  <div className="text-[9px] text-slate-400 lowercase">{member.email}</div>
                                </td>
                                <td className="py-4 px-4 hidden sm:table-cell text-[10px] uppercase text-slate-400">
                                  {isHost ? 'RACE HOST' : member.isBot ? 'BOT DRIVER' : 'STRATEGIST'}
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-sm text-slate-900 dark:text-white">
                                  {member.points} PTS
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Simulated Race History Log */}
                {selectedLeague.history && selectedLeague.history.length > 0 && (
                  <div className="glass-panel p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">GP CLASH CHRONICLES</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedLeague.history.slice().reverse().map((hist, idx) => (
                        <div key={idx} className="p-4 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col md:flex-row justify-between gap-4 font-mono text-xs">
                          <div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(hist.simulatedAt).toLocaleString().toUpperCase()}
                            </div>
                            <h5 className="font-serif font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                              {hist.raceName.toUpperCase()} (R{hist.round})
                            </h5>
                            
                            <div className="flex gap-4 mt-3 flex-wrap text-[10px]">
                              <div>
                                <span className="text-[8px] text-slate-400 block uppercase">WINNER</span>
                                <span className="text-red-500 font-bold">{hist.results.winner.toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 block uppercase">POLE</span>
                                <span className="text-white font-bold">{hist.results.pole.toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 block uppercase">FASTEST LAP</span>
                                <span className="text-white font-bold">{hist.results.fastestLap.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
                            <div>
                              <div className="text-[8px] text-slate-400 uppercase tracking-widest">GP HIGHEST EARNER</div>
                              <div className="text-xs font-bold text-green-500 mt-0.5">
                                {hist.standings && hist.standings[0] ? `${hist.standings[0].displayName.toUpperCase()} (+${hist.standings[0].pointsEarned} PTS)` : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Historical Commentary Feed */}
                          {hist.commentary && hist.commentary.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-250 dark:border-white/5 w-full md:col-span-2">
                              <div className="text-[9px] text-red-500 font-bold uppercase mb-1.5">Simulation Transcripts</div>
                              <div className="space-y-1.5 text-[10px] text-slate-400 font-mono bg-black/40 p-2.5 rounded border border-white/5">
                                {hist.commentary.map((line, cIdx) => (
                                  <div key={cIdx} className="border-l border-slate-700 pl-2">{line}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default FantasyPage;
