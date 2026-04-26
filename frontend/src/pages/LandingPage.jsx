import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Target, Activity, Trophy, AlertTriangle } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      title: "Strategy Simulator",
      description: "Project outcomes based on pit window, tire compounds, and live telemetry. See the race before it happens.",
      icon: <Activity className="w-6 h-6 text-red-500" />
    },
    {
      title: "Tire Life Models",
      description: "Predict degradation curves across all compounds. Understand when the cliff hits before the drivers do.",
      icon: <Target className="w-6 h-6 text-red-500" />
    },
    {
      title: "Head-to-Head Deltas",
      description: "Analyze gap closures and time loss lap-by-lap. Identify undercuts and overcuts in real-time.",
      icon: <Trophy className="w-6 h-6 text-red-500" />
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
    <div className="flex flex-col items-center pt-12 pb-32 overflow-hidden">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-5xl px-4 relative z-10 w-full"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          V2.0 Core Active
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tighter mb-6 leading-[0.9]">
          Understand Strategy Like An <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 italic">F1 Engineer.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-mono tracking-wide">
          Not just a stats page. A live telemetry engine, tire degradation model, and predictive pit wall terminal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 group transition-all">
            Access Terminal
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login?setup=true" className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-bold uppercase tracking-widest text-sm transition-opacity flex items-center justify-center">
            Create Free Account
          </Link>
        </div>
      </motion.div>

      {/* Abstract Dashboard Demo visual */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-full max-w-5xl mt-16 px-4 relative z-0"
      >
        <div className="w-full h-[400px] md:h-[500px] border-[3px] border-slate-900 dark:border-white bg-[#0a0a0a] relative overflow-hidden flex flex-col shadow-2xl">
           <div className="w-full h-8 border-b border-white/10 flex items-center px-4 gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <div className="ml-4 text-[10px] font-mono text-slate-500 uppercase">PitWall Simulator / Live</div>
           </div>
           
           <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="w-1/3 h-6 bg-white/10"></div>
              <div className="flex gap-4 flex-1">
                 <div className="w-2/3 h-full border border-white/10 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 99%, #fff 100%)', backgroundSize: '10% 100%' }}></div>
                    {/* Simulated chart line */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <motion.path 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        d="M0,80 Q20,80 30,50 T70,30 T100,10" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="2" 
                      />
                    </svg>
                 </div>
                 <div className="w-1/3 h-full flex flex-col gap-4">
                    <div className="flex-1 border border-white/10 bg-white/5 p-4 flex flex-col justify-end">
                      <div className="w-full h-2 bg-red-500/20 mb-2 relative"><motion.div className="absolute top-0 left-0 h-full bg-red-500" animate={{ width: ['0%', '100%'] }} transition={{ duration: 3, repeat: Infinity }} /></div>
                      <div className="text-[10px] font-mono text-red-500 uppercase">Undercut Alert</div>
                    </div>
                    <div className="flex-1 border border-white/10 bg-white/5 p-4 flex items-center justify-center relative overflow-hidden">
                      <motion.img 
                        src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
                        alt="F1 Logo"
                        animate={{ opacity: [0.1, 0.6, 0.1] }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-3/4 h-auto"
                        style={{ filter: 'brightness(0) saturate(100%) invert(35%) sepia(85%) saturate(3015%) hue-rotate(344deg) brightness(98%) contrast(98%)' }}
                      />
                      <div className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-600 uppercase tracking-widest">System Link</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Feature Breakdown */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 max-w-6xl w-full px-8"
      >
        {features.map((feature, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="flex flex-col group"
          >
            <div className="w-12 h-12 border-2 border-slate-900 dark:border-white flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 uppercase tracking-tight">{feature.title}</h3>
            <div className="w-8 h-1 bg-red-600 mb-4 transition-all group-hover:w-16"></div>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed font-mono text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default LandingPage;
