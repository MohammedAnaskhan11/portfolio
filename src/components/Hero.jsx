import { motion } from 'framer-motion';
import { ChevronDown, Download, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import Photo3D from './Photo3D';
import { useEffect, useState, useRef } from 'react';
import { useData } from '../context/DataContext';

function useTypingEffect(phrases, { typingSpeed = 60, deletingSpeed = 35, pauseMs = 1800 } = {}) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;
    if (prefersReduced.current) { setDisplayed(phrases[0]); return; }
    const current = phrases[phraseIdx % phrases.length];
    if (!deleting && charIdx <= current.length) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx(c => c + 1); },
        charIdx === current.length ? pauseMs : typingSpeed);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx > current.length) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx >= 0) {
      const t = setTimeout(() => { setDisplayed(current.slice(0, charIdx)); setCharIdx(c => c - 1); }, deletingSpeed);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx < 0) { setDeleting(false); setPhraseIdx(i => (i + 1) % phrases.length); setCharIdx(0); }
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };

function Stat({ value, label }) {
  return (
    <div className="flex flex-col items-end">
      <span className="font-display font-bold text-xl leading-none" style={{ color: 'rgb(var(--c-primary))' }}>{value}</span>
      <span className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--col-muted)' }}>{label}</span>
    </div>
  );
}

export default function Hero() {
  const { data } = useData();
  const h = data.hero;
  const roles = useTypingEffect(h.roles);

  return (
    <section id="hero" className="relative min-h-screen flex items-center z-10 px-6 md:px-12 lg:px-20 pt-16">
      <div className="absolute top-20 right-6 w-80 h-80 rounded-full border border-accent/8 pointer-events-none" />
      <div className="absolute top-32 right-16 w-52 h-52 rounded-full border border-violet/8 pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-60 h-60 rounded-full border border-violet/6 pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-4 items-center">
        <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col gap-5 order-2 lg:order-1">

          {/* Availability badge */}
          {h.available && (
            <motion.div variants={item} className="flex items-center gap-2 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="font-mono text-xs text-green-400/90 tracking-wide">{h.availabilityText}</span>
            </motion.div>
          )}

          {/* Eyebrow */}
          <motion.div variants={item} className="flex items-center gap-3">
            <span className="h-px w-10 bg-accent" />
            <span className="font-mono text-sm text-accent/80 tracking-widest uppercase">Portfolio</span>
          </motion.div>

          {/* Name */}
          <motion.h1 variants={item} className="font-display font-bold text-5xl md:text-6xl xl:text-[4.25rem] leading-[1.04] tracking-tight" style={{ color: 'var(--col-heading)' }}>
            {h.name.split(' ').slice(0, -1).join(' ')}
            <br />
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--c-primary)) 0%, rgb(var(--c-secondary)) 100%)' }}>
              {h.name.split(' ').slice(-1)[0]}
            </span>
          </motion.h1>

          {/* Typing role */}
          <motion.div variants={item} className="flex items-center gap-2 h-7">
            <span className="font-mono text-base" style={{ color: 'var(--col-body)' }}>{roles}</span>
            <span className="inline-block w-[2px] h-5 rounded-full" style={{ background: 'rgb(var(--c-primary))', animation: 'blink 1s step-end infinite' }} />
          </motion.div>

          {/* Chips */}
          {h.chips && h.chips.length > 0 && (
            <motion.div variants={item} className="flex flex-wrap gap-2">
              {h.chips.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-mono transition-all duration-200"
                  style={{
                    border: '1px solid rgba(var(--c-primary)/0.20)',
                    background: 'rgba(var(--c-primary)/0.06)',
                    color: 'var(--col-muted)',
                  }}>
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Bio */}
          <motion.p variants={item} className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--col-muted)' }}>{h.bio}</motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-3 pt-1">
            <a href="#projects"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))', color: 'white' }}>
              View Projects
            </a>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
              style={{ border: '1px solid rgba(var(--c-primary)/0.4)', color: 'rgb(var(--c-primary))' }}>
              <Download className="w-4 h-4" /> Resume
            </a>
          </motion.div>

          {/* Socials */}
          <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
            <a href={h.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ border: '1px solid rgba(var(--c-primary)/0.18)', background: 'rgba(var(--c-primary)/0.05)', color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-primary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href={h.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
              style={{ border: '1px solid rgba(var(--c-primary)/0.18)', background: 'rgba(var(--c-primary)/0.05)', color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-secondary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-1.5 text-xs font-mono ml-1" style={{ color: 'var(--col-muted)' }}>
              <MapPin className="w-3 h-3" />{h.location}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: photo */}
        <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-end relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle,rgba(62,242,208,0.08) 0%,transparent 70%)' }} />
            <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              className="absolute w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle,rgba(124,92,255,0.07) 0%,transparent 70%)', transform: 'translateX(30px)' }} />
          </div>
          <div className="hidden lg:flex flex-col gap-7 mr-5 text-right">
            <Stat value="8.5"  label="CGPA / 10" />
            <Stat value="2+"   label="Hackathon Wins" />
            <Stat value="3+"   label="AI/ML Projects" />
            <Stat value="2027" label="Graduation" />
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[290px] h-[370px] md:w-[350px] md:h-[445px] lg:w-[390px] lg:h-[500px]">
            <Photo3D />
          </motion.div>
        </div>
      </div>

      <motion.a href="#about" aria-label="Scroll to about"
        animate={{ y: [0, 9, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 hover:text-accent transition-colors">
        <span className="font-mono text-[10px] tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </motion.a>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </section>
  );
}
