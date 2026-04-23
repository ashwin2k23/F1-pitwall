import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, BarChart2, Calendar, Trophy } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      title: "Real-time Standings",
      description: "Track driver and constructor championships as the season unfolds with beautiful visual data.",
      icon: <Trophy className="w-6 h-6 text-purple-400" />
    },
    {
      title: "Race Calendar",
      description: "Never miss a session. Get localized start times and a live countdown to the next lights out.",
      icon: <Calendar className="w-6 h-6 text-blue-400" />
    },
    {
      title: "Performance Analytics",
      description: "Dive deep into telemetry, lap times, and historical data to analyze your favorite team's tempo.",
      icon: <BarChart2 className="w-6 h-6 text-cyan-400" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col items-center pt-20 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-4xl px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border-blue-500/30 text-blue-300 text-sm mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          2026 Season Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Your Personal Formula 1 <br/>
          <span className="primary-gradient-text">Season Dashboard</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          The ultimate telemetry and tracking station. Monitor standings, analyze team performance, and count down to lights out with a state-of-the-art interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login?setup=true" className="primary-button flex items-center justify-center gap-2 group text-lg px-8 py-3">
            Get Started
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="px-8 py-3 rounded-lg glass-panel hover:bg-white/10 transition-colors font-medium">
            Live Demo
          </Link>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full px-4"
      >
        {features.map((feature, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="glass-panel p-8"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LandingPage;
