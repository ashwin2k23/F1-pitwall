import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, RefreshCw, Image as ImageIcon, MessageCircle } from 'lucide-react';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [memes, setMemes] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingMemes, setLoadingMemes] = useState(true);

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      // Using RSS2JSON to bypass CORS and rate limits on browser
      const res = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.autosport.com%2Frss%2Ff1%2Fnews%2F');
      if (res.data && res.data.items) {
        setNews(res.data.items.slice(0, 15));
      }
    } catch (err) {
      console.error('Failed to fetch news', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchMemes = async () => {
    setLoadingMemes(true);
    try {
      const res = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fformuladank%2Fhot.rss');
      if (res.data && res.data.items) {
        // Extract image URL from content or thumbnail
        const posts = res.data.items.map(item => {
           let imageUrl = item.thumbnail || (item.enclosure && item.enclosure.link);
           if (!imageUrl) {
             const match = item.content.match(/<img[^>]+src="([^">]+)"/);
             if (match) imageUrl = match[1];
           }
           // Replace amp; in urls
           if (imageUrl) imageUrl = imageUrl.replace(/&amp;/g, '&');
           
           return {
             ...item,
             imageUrl: imageUrl
           };
        }).filter(post => post.imageUrl && !post.imageUrl.includes('external-preview.redd.it') && (post.imageUrl.includes('.jpg') || post.imageUrl.includes('.png') || post.imageUrl.includes('.jpeg') || post.imageUrl.includes('preview.redd.it')));
        
        // If we didn't get enough good images, just use whatever has an imageUrl
        const validMemes = posts.length > 0 ? posts : res.data.items.filter(item => item.thumbnail).map(i => ({...i, imageUrl: i.thumbnail.replace(/&amp;/g, '&')}));
        setMemes(validMemes.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to fetch memes', err);
    } finally {
      setLoadingMemes(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchMemes();
  }, []);

  return (
    <div className="pt-2 pb-20">
      <div className="mb-12 border-b-[3px] border-slate-900 dark:border-white pb-6">
        <h1 className="text-5xl md:text-7xl font-serif text-slate-900 dark:text-white capitalize tracking-tighter">
          Paddock <span className="text-red-600 font-bold italic">Wire.</span>
        </h1>
        <p className="text-slate-500 font-mono tracking-widest uppercase mt-4 text-sm">Latest updates and grid chatter</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
        {/* Main Column - News */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-end mb-2">
             <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Breaking <span className="text-red-600 italic">News</span></h3>
             <button onClick={fetchNews} className="text-[10px] uppercase font-mono tracking-widest text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
               <RefreshCw className={`w-3 h-3 ${loadingNews ? 'animate-spin text-red-600' : ''}`} /> Sync
             </button>
          </div>

          <div className="editorial-border flex flex-col gap-0 border-b border-slate-200 dark:border-white/10">
            {loadingNews ? (
               <div className="py-12 text-center text-sm font-mono text-slate-500 animate-pulse">Establishing connection to paddock...</div>
            ) : news.length > 0 ? (
               news.map((item, idx) => (
                 <a 
                   key={idx} 
                   href={item.link}
                   target="_blank"
                   rel="noreferrer"
                   className="py-5 border-b border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group flex gap-4"
                 >
                   {item.thumbnail && (
                      <div className="w-24 h-24 shrink-0 bg-slate-200 dark:bg-white/5 overflow-hidden border border-slate-300 dark:border-white/10 hidden sm:block">
                         <img src={item.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                   )}
                   <div className="flex flex-col justify-between flex-1">
                     <h4 className="text-lg font-serif font-bold text-slate-900 dark:text-white leading-tight group-hover:text-red-600 transition-colors">
                       {item.title}
                     </h4>
                     <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase text-slate-500 mt-3">
                       <span className="text-red-600 font-bold">Autosport</span>
                       <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                       <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-red-600 flex items-center gap-1">Read <ExternalLink className="w-3 h-3" /></span>
                     </div>
                   </div>
                 </a>
               ))
            ) : (
               <div className="py-12 text-center text-sm font-mono text-slate-500">No signals found.</div>
            )}
          </div>
        </div>
        
        {/* Side Column - Memes */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex justify-between items-end mb-2">
             <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Grid <span className="text-red-600 italic">Chatter</span></h3>
             <button onClick={fetchMemes} className="text-[10px] uppercase font-mono tracking-widest text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
               <RefreshCw className={`w-3 h-3 ${loadingMemes ? 'animate-spin text-red-600' : ''}`} /> Sync
             </button>
          </div>

          <div className="editorial-border flex flex-col gap-6 pt-6">
            {loadingMemes ? (
               <div className="py-12 text-center text-sm font-mono text-slate-500 animate-pulse">Decrypting radio messages...</div>
            ) : memes.length > 0 ? (
               memes.map((meme, idx) => (
                 <div key={idx} className="group cursor-pointer">
                    <div className="bg-slate-100 dark:bg-[#111111] border border-slate-200 dark:border-white/10 p-2 relative overflow-hidden">
                       <img src={meme.imageUrl} alt="Meme" className="w-full h-auto object-cover max-h-96 hover:scale-[1.02] transition-transform duration-500" />
                       <a 
                         href={meme.link}
                         target="_blank"
                         rel="noreferrer"
                         className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                       >
                         <span className="text-white font-mono text-xs tracking-widest uppercase border border-white/30 px-4 py-2 hover:bg-white hover:text-black transition-colors flex items-center gap-2">
                           <ImageIcon className="w-4 h-4" /> View Full
                         </span>
                       </a>
                    </div>
                    <div className="mt-2 text-sm font-serif font-bold text-slate-900 dark:text-gray-200 leading-snug">
                      {meme.title}
                    </div>
                 </div>
               ))
            ) : (
               <div className="py-12 text-center text-sm font-mono text-slate-500">No chatter detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
