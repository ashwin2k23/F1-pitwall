import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const HistoryPage = () => {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('https://api.jolpi.ca/ergast/f1/current/results/1.json');
        const racesData = res.data.MRData.RaceTable.Races;
        
        const mapped = racesData.map(race => ({
          round: race.round,
          name: race.raceName,
          winner: `${race.Results[0].Driver.givenName} ${race.Results[0].Driver.familyName}`,
          team: race.Results[0].Constructor.name,
          time: race.Results[0].Time?.time || 'N/A'
        }));
        
        setRaces(mapped);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="pt-6 pb-20 max-w-5xl mx-auto px-4 sm:px-0">
      <div className="border-b-[3px] border-slate-900 dark:border-white pb-6 mb-8">
         <h1 className="text-5xl font-serif font-bold mb-2 text-slate-900 dark:text-white tracking-tighter">Season <span className="text-red-600 italic">History</span></h1>
         <p className="text-sm font-mono uppercase tracking-widest text-slate-500 dark:text-gray-400">Review the complete results of the most recent championship.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="editorial-border py-4"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black dark:border-white">
                <th className="px-4 pr-6 py-4 text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Round</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Grand Prix</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Winner</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">Constructor</th>
                <th className="px-6 py-4 text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center font-mono text-xs text-slate-500 dark:text-gray-500 uppercase tracking-widest animate-pulse">Syncing Database...</td></tr>
              ) : (
                races.map((race, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={race.round} 
                    className="border-b border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 pr-6 py-4 font-serif text-xl font-bold text-slate-900 dark:text-white">{String(race.round).padStart(2, '0')}</td>
                    <td className="px-6 py-4 font-serif font-bold text-base text-slate-900 dark:text-white">{race.name.replace('Grand Prix', 'GP')}</td>
                    <td className="px-6 py-4 font-serif text-slate-700 dark:text-gray-300">{race.winner}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-[10px] font-mono uppercase tracking-widest font-bold
                        ${race.team.includes('Red Bull') ? 'text-blue-600 dark:text-blue-400' : ''}
                        ${race.team.includes('Ferrari') ? 'text-red-600 dark:text-red-500' : ''}
                        ${race.team.includes('McLaren') ? 'text-orange-600 dark:text-orange-500' : ''}
                        ${race.team.includes('Mercedes') ? 'text-teal-600 dark:text-teal-400' : ''}
                      `}>
                        {race.team}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm tracking-widest text-right font-bold text-slate-900 dark:text-white">{race.time}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
