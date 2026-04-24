import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { Save, User, Settings } from 'lucide-react';
import axios from 'axios';
import { getDriverImage } from '../utils/driverImages';

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [favoriteTeam, setFavoriteTeam] = useState(user?.favoriteTeam || 'McLaren');
  const [favoriteDriver, setFavoriteDriver] = useState(user?.favoriteDriver || 'Lando Norris');
  const [displayName, setDisplayName] = useState(user?.preferences?.displayName || '');
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode ?? true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const teams = [
    'McLaren', 'Ferrari', 'Red Bull Racing', 'Mercedes', 'Aston Martin', 
    'Alpine', 'Williams', 'RB', 'Sauber', 'Haas'
  ];
  
  const drivers = [
    'Alexander Albon', 'Andrea Kimi Antonelli', 'Carlos Sainz', 'Charles Leclerc', 
    'Daniel Ricciardo', 'Esteban Ocon', 'Fernando Alonso', 'Franco Colapinto', 
    'George Russell', 'Kevin Magnussen', 'Lance Stroll', 'Lando Norris', 
    'Lewis Hamilton', 'Liam Lawson', 'Logan Sargeant', 'Max Verstappen', 
    'Nico Hulkenberg', 'Oliver Bearman', 'Oscar Piastri', 'Pierre Gasly', 
    'Sergio Perez', 'Valtteri Bottas', 'Yuki Tsunoda', 'Zhou Guanyu'
  ];

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/user/preferences`, {
        favoriteTeam,
        favoriteDriver,
        preferences: { darkMode, displayName }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // update context
      login(res.data, token);
      setSuccessMsg('Preferences saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-center text-gray-400">Please sign in to view your profile.</div>;

  const driverPhotoUrl = getDriverImage(favoriteDriver);

  // Custom Dropdown Component internal to the page to avoid breaking out
  const CustomSelect = ({ label, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative">
        <label className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">{label}</label>
        <div 
          className="w-full bg-transparent border-b-2 border-slate-300 dark:border-white/20 px-0 py-2 text-slate-900 dark:text-white font-serif text-lg cursor-pointer flex justify-between items-center group"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="group-hover:text-red-600 transition-colors">{value}</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-2xl max-h-64 overflow-y-auto hidden-scrollbar">
            {options.map(opt => (
              <div 
                key={opt}
                className={`px-4 py-3 font-serif text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${value === opt ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 font-bold border-l-2 border-red-600' : 'border-l-2 border-transparent'}`}
                onClick={() => { onChange(opt); setIsOpen(false); }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
        {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
      </div>
    );
  };

  return (
    <div className="pt-6 pb-20 max-w-3xl mx-auto px-4 sm:px-0">
      <div className="border-b-[3px] border-slate-900 dark:border-white pb-6 mb-8">
         <h1 className="text-5xl font-serif font-bold mb-2 text-slate-900 dark:text-white tracking-tighter">Profile & <span className="text-red-600 italic">Preferences</span></h1>
         <p className="text-sm font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400">Customize your workspace.</p>
      </div>

      <div className="space-y-12">
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-mono tracking-widest uppercase font-bold">
            {successMsg}
          </motion.div>
        )}

        {/* User Info Section */}
        <div>
           <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Identity</h3>
           <div className="editorial-border py-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 border-2 border-slate-900 dark:border-white flex items-center justify-center bg-transparent overflow-hidden object-cover overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {driverPhotoUrl ? (
                      <img src={driverPhotoUrl} alt={favoriteDriver} className="w-full h-full object-cover mt-2 scale-110" />
                    ) : (
                      <User className="w-8 h-8 text-slate-900 dark:text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white leading-none">{displayName || user?.preferences?.displayName || user.email?.split('@')[0]}</h2>
                    <p className="font-mono text-xs tracking-widest text-slate-500 mt-2 uppercase">{user.email}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                  <label className="block text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-2">Display Name Override</label>
                  <input 
                    type="text" 
                    placeholder="Enter custom handle..." 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-slate-300 dark:border-white/20 px-0 py-2 text-slate-900 dark:text-white font-serif text-lg focus:outline-none focus:border-red-600 transition-colors placeholder:text-slate-300 dark:placeholder:text-gray-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">This name will appear on your Pit Wall.</p>
                </div>
              </div>
           </div>
        </div>

        {/* F1 Preferences */}
        <div>
           <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center gap-2">
             <Settings className="w-5 h-5 text-red-600" /> Platform <span className="text-red-600 italic">Settings</span>
           </h3>
           <div className="editorial-border py-6 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20">
                <CustomSelect 
                  label="Favorite Team" 
                  options={teams} 
                  value={favoriteTeam} 
                  onChange={setFavoriteTeam} 
                />
                
                <CustomSelect 
                  label="Favorite Driver" 
                  options={drivers} 
                  value={favoriteDriver} 
                  onChange={setFavoriteDriver} 
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase mb-1">Dark Mode Override</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Force Pitch Black Aesthetic</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={darkMode} onChange={(e) => {
                     const newMode = e.target.checked;
                     setDarkMode(newMode);
                     if (newMode) document.documentElement.classList.add('dark');
                     else document.documentElement.classList.remove('dark');
                  }} />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-none peer dark:bg-slate-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600 border border-slate-900 dark:border-white/20"></div>
                </label>
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors"
          >
            {loading ? <span className="animate-pulse">Syncing...</span> : <><Save className="w-4 h-4" /> Publish Change</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
