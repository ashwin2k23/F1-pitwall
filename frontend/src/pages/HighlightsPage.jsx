import { Film, Play } from 'lucide-react';

// Fallback videos in case the API is down
const FALLBACK_VIDEOS = [
  { id: 'DAl4E5fcH2E', title: 'F1 Podium Finishes — Drivers Get Progressively Younger', race: 'All Time Classic', label: 'CLASSIC' },
  { id: 'OBLYrKE_P0Q', title: '"If I Believe I\'m Good. I\'m Good." | Isack Hadjar Exclusive', race: '2026 Season', label: 'INTERVIEW' },
  { id: 'vdgZoVvuUQ0', title: 'What Makes The Perfect F1 Driver? | F1 Nation', race: '2026 Season', label: 'PODCAST' },
  { id: 'ea_OWWpRNTI', title: 'Colton Herta: Doing The Work | F1 Beyond The Grid', race: '2026 Season', label: 'PODCAST' },
  { id: '5XB2XVyvhdk', title: 'Bearman & Ocon vs The Internet — Social Media Quiz', race: '2026 Season', label: 'ENTERTAINMENT' },
  { id: 'TLAioTwTfFc', title: 'F1 Drivers Explain Tamagotchis 🤔', race: '2026 Season', label: 'ENTERTAINMENT' },
];

const LABEL_COLORS = {
  'CLASSIC':       'bg-purple-600',
  'INTERVIEW':     'bg-blue-600',
  'PODCAST':       'bg-green-600',
  'DRIVER FEATURE':'bg-orange-500',
  'ENTERTAINMENT': 'bg-pink-600',
  'ESPORTS':       'bg-yellow-500 text-black',
  'RACE HIGHLIGHTS':'bg-red-600',
};

import { useState, useEffect } from 'react';

const HighlightsPage = () => {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/youtube/latest`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
             setVideos(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch youtube videos", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideos();
  }, []);

  return (
    <div className="pt-2 pb-20">
      {/* Header */}
      <div className="mb-12 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex items-center gap-3 mb-4">
          <Film className="w-5 h-5 text-red-600" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-red-600 font-bold">Official F1 Channel</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white tracking-tighter">
          Race <span className="text-red-600 font-bold italic">Highlights.</span>
        </h1>
        <p className="text-slate-500 font-mono tracking-widest uppercase mt-3 text-sm">
          Click any video to watch on YouTube →
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-8 h-8 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noreferrer"
              className="group block"
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden aspect-video bg-slate-800 mb-3">
                <img
                  src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 flex items-center justify-center opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-red-600/50">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                {/* Label badge */}
                <div className={`absolute top-2 left-2 text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 text-white ${LABEL_COLORS[v.label] || 'bg-red-600'}`}>
                  {v.label}
                </div>
              </div>

              {/* Info */}
              <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">{v.race}</p>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                {v.title}
              </h3>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default HighlightsPage;
