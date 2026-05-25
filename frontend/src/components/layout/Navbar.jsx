import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { Flag, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

import { getDriverImage } from '../../utils/driverImages';
import LiveTelemetryClock from '../common/LiveTelemetryClock';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const driverPhotoUrl = user ? getDriverImage(user?.favoriteDriver || 'Lando Norris') : null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Live', path: '/live' },
    { name: 'Strategy Lab', path: '/strategy' },
    { name: 'Battle', path: '/battle' },
    { name: 'Fantasy', path: '/fantasy' },
    { name: 'Drivers', path: '/drivers' },
    { name: 'Teams', path: '/teams' },
    { name: 'Highlights', path: '/highlights' },
    { name: 'News', path: '/news' },
    { name: 'History', path: '/history' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b-[3px] border-red-600 px-6 py-3.5 flex justify-between items-center transition-all text-white">
      <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-650 flex items-center justify-center -skew-x-12 shadow-[0_0_10px_rgba(225,6,0,0.4)]">
          <Flag className="w-4 h-4 text-white skew-x-12" />
        </div>
        <span className="text-2xl font-serif font-black tracking-tighter text-white uppercase italic">
          PITWALL
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`relative text-xs font-bold tracking-widest uppercase transition-colors ${location.pathname === link.path ? 'text-red-500 font-extrabold' : 'text-slate-350 hover:text-white'}`}
          >
            {location.pathname === link.path && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute -bottom-[19px] left-0 right-0 h-[3px] bg-red-650"
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              />
            )}
            <span>{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:block">
          <LiveTelemetryClock />
        </div>
        {user ? (
          <>
            <Link to="/profile" className="flex items-center gap-3 hover:opacity-70 transition-opacity group">
              <div className="w-8 h-8 border border-slate-800 flex items-center justify-center group-hover:bg-slate-800 transition-colors overflow-hidden bg-slate-900">
                {driverPhotoUrl ? (
                   <img src={driverPhotoUrl} alt="Avatar" className="w-full h-full object-cover mt-1 scale-[1.3]" />
                ) : (
                   <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                )}
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest hidden sm:block text-white">
                 {user?.preferences?.displayName || user.email?.split('@')[0]}
              </span>
            </Link>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex gap-3 font-mono text-xs">
            <Link to="/login" className="px-4 py-2 text-slate-400 hover:text-white flex items-center">
              LOG IN
            </Link>
            <Link to="/login?setup=true" className="primary-button">
              <span>GET STARTED</span>
            </Link>
          </div>
        )}
        
        {/* Mobile menu toggle */}
        <button 
          className="md:hidden text-slate-900 dark:text-white ml-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-[#090d16]/95 backdrop-blur-lg border-b-2 border-red-600 py-4 px-6 flex flex-col gap-4 md:hidden z-50 shadow-2xl"
        >
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-bold tracking-widest uppercase py-2 border-b border-slate-800 ${location.pathname === link.path ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
