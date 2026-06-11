import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabase';
import defaultData from '../data/defaultData';

const BUCKET = 'achievement-images';

// Build a URL→{caption,sub} map from defaultData so captions survive stale Supabase cache
const DEFAULT_CAPTION_MAP = new Map(
  (defaultData.achievementImages || [])
    .filter(d => d.url && d.url.startsWith('http'))
    .map(d => [d.url, { caption: d.caption, sub: d.sub }])
);

async function loadStorageImages() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      sortBy: { column: 'created_at', order: 'asc' },
    });
    if (error || !data) return [];
    const imgs = data.filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f.name));
    return imgs.map(f => {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      // Use defaultData caption if URL matches, else generate from filename
      const mapped = DEFAULT_CAPTION_MAP.get(publicUrl);
      return {
        id: f.name,
        url: publicUrl,
        caption: mapped?.caption || f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').replace(/^ach \d+$/i, 'Achievement Photo'),
        sub: mapped?.sub || '',
      };
    });
  } catch { return []; }
}

// ── Auto-sliding image carousel ───────────────────────────────────
function AchievementCarousel({ images }) {
  const [idx, setIdx]       = useState(0);
  const [dir, setDir]       = useState(1);   // 1=forward -1=backward
  const [paused, setPaused] = useState(false);

  const go = useCallback((nextIdx, direction) => {
    setDir(direction);
    setIdx(nextIdx);
  }, []);

  const prev = () => {
    const next = (idx - 1 + images.length) % images.length;
    go(next, -1);
  };
  const next = () => {
    const n = (idx + 1) % images.length;
    go(n, 1);
  };

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (paused || images.length <= 1) return;
    const t = setTimeout(() => {
      setDir(1);
      setIdx(i => (i + 1) % images.length);
    }, 4000);
    return () => clearTimeout(t);
  }, [idx, paused, images.length]);

  if (!images || images.length === 0) return null;

  const variants = {
    enter: d => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  d => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}
      className="mb-16">

      {/* Carousel frame */}
      <div className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: '16/7', background: '#0a0b12' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>

        {/* Slides */}
        <AnimatePresence custom={dir} initial={false}>
          <motion.div key={idx} custom={dir}
            variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-0">
            <img src={images[idx].url} alt={images[idx].caption}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }} />

            {/* Gradient overlay */}
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 rounded-full px-3 py-1 mb-2">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-mono text-amber-300">Achievement</span>
                </div>
                <p className="text-white font-display font-bold text-xl md:text-2xl">{images[idx].caption}</p>
                {images[idx].sub && <p className="text-gray-300 text-sm mt-1 font-mono">{images[idx].sub}</p>}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Left / right arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center
                bg-black/40 border border-white/10 text-white/70 hover:bg-black/60 hover:text-white
                backdrop-blur-sm transition-all duration-200 z-10">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={next} aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center
                bg-black/40 border border-white/10 text-white/70 hover:bg-black/60 hover:text-white
                backdrop-blur-sm transition-all duration-200 z-10">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Glow border */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.15)' }} />
      </div>

      {/* Dot indicators + progress bar */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button key={i} onClick={() => go(i, i > idx ? 1 : -1)} aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${i === idx ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function Achievements() {
  const { data } = useData();
  const items = data.achievements || [];

  const [images, setImages] = useState(data.achievementImages || []);

  useEffect(() => {
    loadStorageImages().then(storageImgs => {
      // Always show local images (ach1.png, ach2.png) + Supabase images
      const localImgs = defaultData.achievementImages.filter(d => d.url && !d.url.startsWith('http'));
      const merged = [...localImgs, ...storageImgs];
      if (merged.length > 0) setImages(merged);
    });
  }, []);

  return (
    <section id="achievements" className="py-28 px-6 max-w-6xl mx-auto">
      {/* Heading */}
      <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true, amount:0.2 }} transition={{ duration:0.6 }}>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">Achievements</h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-14"
          style={{ background: 'linear-gradient(90deg,#f59e0b,#3ef2d0)' }} />
      </motion.div>

      {/* Sliding image carousel */}
      {images.length > 0 && <AchievementCarousel images={images} />}

      {/* Achievement cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((it, i) => (
          <motion.div key={it.id || i}
            initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, amount:0.2 }} transition={{ duration:0.6, delay:i*0.15 }}
            className="relative group">
            <div className="absolute -inset-[1px] rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-[0.5px]"
              style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.5),rgba(62,242,208,0.3),rgba(124,92,255,0.4))' }} />
            <div className="relative rounded-xl overflow-hidden h-full" style={{ background: 'rgba(10,11,18,0.95)', backdropFilter: 'blur(16px)' }}>
              {/* Image strip at top (if achievement has image) */}
              {it.image && (
                <div className="h-36 overflow-hidden relative">
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,11,18,0.98) 100%)' }} />
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 rounded-full px-2.5 py-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-mono text-amber-300">Winner</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {!it.image && (
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(62,242,208,0.1))' }}>
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-white text-base mb-0.5">{it.title}</h3>
                    <div className="text-xs font-mono text-accent/80 mb-1">{it.org}</div>
                    <div className="text-xs text-gray-500 mb-3">{it.date}</div>
                    <p className="text-sm text-gray-400 leading-relaxed">{it.desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
