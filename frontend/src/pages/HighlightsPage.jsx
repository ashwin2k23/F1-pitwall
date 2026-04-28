import { useState, useEffect } from 'react';
import { Film, Play, RefreshCw } from 'lucide-react';

// F1 Official YouTube Channel ID
const F1_CHANNEL_ID = 'UCB_qr75-ydFVKSF9Dmo6izg';
const YT_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${F1_CHANNEL_ID}`;
// Method 1: allorigins CORS proxy → YouTube's own RSS XML (most reliable, no key)
const ALLORIGINS_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(YT_FEED)}`;
// Method 2: rss2json (secondary)
const RSS2JSON_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(YT_FEED)}&count=12`;

// Curated fallback — shown only if the live fetch fails entirely
const FALLBACK_VIDEOS = [
  { id: 'DAl4E5fcH2E', title: 'F1 Podium Finishes — Drivers Get Progressively Younger', race: 'All Time Classic', label: 'CLASSIC' },
  { id: 'OBLYrKE_P0Q', title: '"If I Believe I\'m Good. I\'m Good." | Isack Hadjar Exclusive', race: '2026 Season', label: 'INTERVIEW' },
  { id: 'vdgZoVvuUQ0', title: 'What Makes The Perfect F1 Driver? | F1 Nation', race: '2026 Season', label: 'PODCAST' },
  { id: 'ea_OWWpRNTI', title: 'Colton Herta: Doing The Work | F1 Beyond The Grid', race: '2026 Season', label: 'PODCAST' },
  { id: '5XB2XVyvhdk', title: 'Bearman & Ocon vs The Internet — Social Media Quiz', race: '2026 Season', label: 'ENTERTAINMENT' },
  { id: 'TLAioTwTfFc', title: 'F1 Drivers Explain Tamagotchis 🤔', race: '2026 Season', label: 'ENTERTAINMENT' },
];

// Auto-categorise video by title keywords
const categorise = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('highlights') || t.includes('grand prix') || t.includes('race edit')) return 'RACE HIGHLIGHTS';
  if (t.includes('qualifying') || t.includes('quali')) return 'QUALIFYING';
  if (t.includes('beyond the grid') || t.includes('f1 nation') || t.includes('podcast')) return 'PODCAST';
  if (t.includes('interview') || t.includes('exclusive')) return 'INTERVIEW';
  if (t.includes('esport') || t.includes('virtual')) return 'ESPORTS';
  if (t.includes('driver') || t.includes('team') || t.includes('paddock')) return 'DRIVER FEATURE';
  return 'ENTERTAINMENT';
};

// Extract video ID from YouTube URL
const extractId = (url = '') => {
  try {
    return new URL(url).searchParams.get('v') || '';
  } catch {
    return '';
  }
};

const LABEL_COLORS = {
  'CLASSIC':       'bg-purple-600',
  'INTERVIEW':     'bg-blue-600',
  'PODCAST':       'bg-green-600',
  'DRIVER FEATURE':'bg-orange-500',
  'ENTERTAINMENT': 'bg-pink-600',
  'ESPORTS':       'bg-yellow-500 text-black',
  'RACE HIGHLIGHTS':'bg-red-600',
};

const HighlightsPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVideos = async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    const parseXml = (xmlText) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        const entries = Array.from(doc.querySelectorAll('entry'));
        return entries.map((entry) => {
          const videoId =
            entry.getElementsByTagNameNS('http://www.youtube.com/xml/schemas/2015', 'videoId')[0]?.textContent ||
            entry.querySelector('link')?.getAttribute('href')?.split('v=')[1] || '';
          const title = entry.querySelector('title')?.textContent || '';
          const published = entry.querySelector('published')?.textContent || '';
          if (!videoId) return null;
          const pubDate = published ? new Date(published) : null;
          return {
            id: videoId,
            title,
            race: pubDate ? pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '2026 Season',
            label: categorise(title),
          };
        }).filter(Boolean);
      } catch { return []; }
    };

    try {
      // Method 1: allorigins.win CORS proxy → YouTube RSS XML
      try {
        const res1 = await fetch(ALLORIGINS_URL);
        if (res1.ok) {
          const json1 = await res1.json();
          const v1 = parseXml(json1.contents || '');
          if (v1.length > 0) { setVideos(v1); setIsLive(true); return; }
        }
      } catch { /* fall through */ }

      // Method 2: rss2json
      try {
        const res2 = await fetch(RSS2JSON_URL);
        const d2 = await res2.json();
        if (d2.status === 'ok' && d2.items?.length > 0) {
          const v2 = d2.items.map((item) => {
            const id = extractId(item.link);
            if (!id) return null;
            const pubDate = item.pubDate ? new Date(item.pubDate) : null;
            return { id, title: item.title, label: categorise(item.title),
              race: pubDate ? pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '2026 Season' };
          }).filter(Boolean);
          if (v2.length > 0) { setVideos(v2); setIsLive(true); return; }
        }
      } catch { /* fall through */ }

      // Method 3: curated fallback
      setVideos(FALLBACK_VIDEOS);
      setIsLive(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  return (
    <div className="pt-2 pb-20">
      {/* Header */}
      <div className="mb-12 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Film className="w-5 h-5 text-red-600" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-red-600 font-bold">Official F1 Channel</span>
            {isLive && (
              <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-green-500 border border-green-500/30 bg-green-500/10 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Feed
              </span>
            )}
          </div>
          <button
            id="highlights-refresh-btn"
            onClick={() => fetchVideos(true)}
            disabled={loading || refreshing}
            className="p-1.5 border border-slate-200 dark:border-slate-700 hover:border-red-600 hover:text-red-600 transition-colors text-slate-400 rounded-sm"
            title="Refresh highlights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
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
