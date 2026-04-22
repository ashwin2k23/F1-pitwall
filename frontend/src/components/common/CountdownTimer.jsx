import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ targetDate = "2025-03-16T06:00:00Z" }) => { // Default to an upcoming race start
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, value], idx) => (
        <div key={unit} className="flex flex-col items-center">
          <motion.div 
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-16 h-16 sm:w-20 sm:h-20 glass-panel flex items-center justify-center bg-slate-200/50 dark:bg-black/40 border-slate-300 dark:border-white/5"
          >
            <span className="text-2xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-700 to-slate-400 dark:from-white dark:to-gray-500">
              {value.toString().padStart(2, '0')}
            </span>
          </motion.div>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-500 mt-2 uppercase tracking-wider font-medium">{unit}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
