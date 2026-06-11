import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useData } from '../context/DataContext';

function Counter({ value, decimals, suffix, from = 0, inView }) {
  const [disp, setDisp] = useState(from);
  useEffect(() => {
    if (!inView) return;
    const dur = 2000, start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(from + (value - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else setDisp(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, from]);
  return <span>{decimals > 0 ? disp.toFixed(decimals) : Math.round(disp)}{suffix}</span>;
}

export default function About() {
  const { data } = useData();
  const ab = data.about;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section id="about" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3"
          style={{ color: 'var(--col-heading)' }}>
          About Me
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-12 md:mb-14"
          style={{ background: 'linear-gradient(90deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))' }} />
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 items-start">
        {/* Bio text */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
          {ab.para1 && (
            <p className="text-base sm:text-lg leading-relaxed mb-6"
              style={{ color: 'var(--col-body)' }}
              dangerouslySetInnerHTML={{
                __html: ab.para1.replace(/\*\*(.*?)\*\*/g,
                  `<strong style="color:var(--col-heading);font-weight:600">$1</strong>`)
              }} />
          )}
          {ab.para2 && (
            <p className="text-sm sm:text-base leading-relaxed mb-6"
              style={{ color: 'var(--col-muted)' }}>
              {ab.para2}
            </p>
          )}
          {ab.para3 && (
            <p className="text-sm sm:text-base leading-relaxed"
              style={{ color: 'var(--col-muted)' }}>
              {ab.para3}
            </p>
          )}

          {/* Quick skills chips */}
          {ab.quickSkills?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2.5">
              {ab.quickSkills.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full text-xs font-mono font-medium"
                  style={{
                    background: 'rgba(var(--c-primary)/0.10)',
                    border: '1px solid rgba(var(--c-primary)/0.25)',
                    color: 'rgb(var(--c-primary))',
                  }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Stats grid */}
        <div ref={ref} className="grid grid-cols-2 gap-3 sm:gap-4">
          {(ab.stats || []).map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-5 text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl sm:text-4xl font-display font-bold mb-1"
                style={{ color: i % 2 === 0 ? 'rgb(var(--c-primary))' : 'rgb(var(--c-secondary))' }}>
                <Counter {...s} inView={inView} />
              </div>
              <div className="text-[11px] sm:text-xs font-mono"
                style={{ color: 'var(--col-muted)' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
