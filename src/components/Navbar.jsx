import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LINKS = [
  { label: 'About',        href: 'about' },
  { label: 'Skills',       href: 'skills' },
  { label: 'Projects',     href: 'projects' },
  { label: 'Achievements', href: 'achievements' },
  { label: 'Experience',   href: 'experience' },
  { label: 'Contact',      href: 'contact' },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const [active, setActive]       = useState('');
  const [progress, setProgress]   = useState(0);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const obsRef = useRef(null);

  // Scroll progress
  const onScroll = useCallback(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(max > 0 ? Math.min(y / max * 100, 100) : 0);
    setScrolled(y > 30);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // Active section via IntersectionObserver
  useEffect(() => {
    const ids = LINKS.map(l => l.href);
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const ratios = {};
    if (obsRef.current) obsRef.current.disconnect();
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { ratios[e.target.id] = e.intersectionRatio; });
      let best = '', bestR = 0;
      ids.forEach(id => { if ((ratios[id] || 0) > bestR) { bestR = ratios[id]; best = id; } });
      if (best) setActive(best);
    }, { threshold: Array.from({ length: 11 }, (_, i) => i / 10), rootMargin: '-10% 0px -10% 0px' });
    els.forEach(el => obs.observe(el));
    obsRef.current = obs;
    return () => obs.disconnect();
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  }, []);

  const navBg = scrolled
    ? dark
      ? 'bg-black/60 backdrop-blur-xl border-b border-white/[0.05]'
      : 'bg-white/80 backdrop-blur-xl border-b border-violet-100 shadow-sm'
    : 'bg-transparent';

  const logoColor = dark ? 'text-accent' : 'text-violet-600';
  const linkBase  = dark
    ? 'text-slate-400 hover:text-slate-100'
    : 'text-slate-500 hover:text-slate-900';
  const linkActive = dark ? 'text-cyan-300' : 'text-violet-600';

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 h-[2px] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--violet)))' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-14 sm:h-16 lg:h-[70px]">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`font-display font-bold text-lg sm:text-xl ${logoColor} tracking-tight hover:opacity-80 transition-opacity relative`}>
            MAK
            <span className="absolute -bottom-0.5 left-0 w-full h-px"
              style={{ background: 'linear-gradient(90deg, rgb(var(--accent)/50%), transparent)' }} />
          </button>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {LINKS.map(({ label, href }) => {
              const isActive = active === href;
              return (
                <li key={href}>
                  <button onClick={() => scrollTo(href)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? linkActive : linkBase}`}>
                    {label}
                    {isActive && (
                      <motion.span layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgb(var(--violet)/0.08)', border: '1px solid rgb(var(--violet)/0.2)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Right side: theme toggle + hamburger */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.92 }}
              className="theme-btn"
              aria-label="Toggle theme"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={dark ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}>
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(p => !p)}
              className={`md:hidden p-2 rounded-lg transition-colors ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-violet-600'}`}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div key="mob"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`fixed inset-0 z-[55] flex flex-col items-center justify-center gap-2 ${dark ? 'bg-black/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl'}`}>

            {/* Close button */}
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2">
              <X size={24} className={dark ? 'text-slate-400' : 'text-slate-500'} />
            </button>

            <motion.ul
              initial="hidden" animate="visible" exit="hidden"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
              className="flex flex-col items-center gap-1 w-full px-8">
              {LINKS.map(({ label, href }) => (
                <motion.li key={href} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="w-full max-w-xs">
                  <button onClick={() => scrollTo(href)}
                    className={`w-full text-center text-xl font-semibold px-6 py-4 rounded-2xl transition-all duration-200
                      ${active === href
                        ? dark ? 'text-cyan-300 bg-violet-500/10' : 'text-violet-600 bg-violet-50'
                        : dark ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'}`}>
                    {label}
                  </button>
                </motion.li>
              ))}
            </motion.ul>

            {/* Theme toggle inside mobile menu */}
            <div className="mt-6">
              <button onClick={toggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono
                  ${dark ? 'text-slate-400 bg-white/5 hover:bg-white/10' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}>
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
