import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Box } from 'lucide-react';
import { GithubIcon } from './icons';
import { useData } from '../context/DataContext';

function Card({ p, i }) {
  const ref = useRef(null);
  const [rx, setRx] = useState(0), [ry, setRy] = useState(0), [hov, setHov] = useState(false);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setRy(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 7);
    setRx(((r.height / 2 - (e.clientY - r.top)) / (r.height / 2)) * 7);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay: i * 0.12 }}>
      <div ref={ref} onMouseMove={onMove}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setRx(0); setRy(0); setHov(false); }}
        className="group glass rounded-2xl p-6 h-full flex flex-col will-change-transform"
        style={{
          transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          borderColor: hov ? `rgba(var(--c-primary)/0.35)` : undefined,
          boxShadow: hov ? `0 0 48px rgba(var(--c-primary)/0.12)` : undefined,
          transition: 'transform 0.2s ease, border-color 0.3s, box-shadow 0.3s',
        }}>

        {/* Icon + Tag */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(var(--c-primary)/0.12)' }}>
            <Box className="w-5 h-5" style={{ color: 'rgb(var(--c-primary))' }} />
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(var(--c-secondary)/0.10)',
              border: '1px solid rgba(var(--c-secondary)/0.25)',
              color: 'rgb(var(--c-secondary))',
            }}>
            {p.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold mb-3 leading-snug"
          style={{ color: 'var(--col-heading)' }}>
          {p.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed flex-1 mb-5"
          style={{ color: 'var(--col-body)' }}>
          {p.desc}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(p.tech || []).map(t => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full font-mono"
              style={{
                background: 'rgba(var(--c-primary)/0.07)',
                border: '1px solid rgba(var(--c-primary)/0.15)',
                color: 'rgb(var(--c-primary))',
              }}>
              {t}
            </span>
          ))}
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-4 mt-auto pt-3"
          style={{ borderTop: '1px solid rgba(var(--c-primary)/0.10)' }}>
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono transition-all duration-200 hover:scale-105"
              style={{ color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-primary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <GithubIcon className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {p.live && (
            <a href={p.live} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono ml-auto transition-all duration-200 hover:scale-105"
              style={{ color: 'var(--col-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(var(--c-secondary))'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--col-muted)'}>
              <ExternalLink className="w-3.5 h-3.5" /> Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { data } = useData();
  const projects = data.projects || [];

  return (
    <section id="projects" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3"
          style={{ color: 'var(--col-heading)' }}>
          Featured Projects
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-12 md:mb-16"
          style={{ background: 'linear-gradient(90deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))' }} />
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {projects.map((p, i) => <Card key={p.id || i} p={p} i={i} />)}
      </div>
    </section>
  );
}
