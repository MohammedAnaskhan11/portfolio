import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useData } from '../context/DataContext';

function SkillBar({ name, pct, colorIdx, inView, delay }) {
  // Alternates between primary and secondary accent colors
  const col = colorIdx % 2 === 0
    ? 'rgb(var(--c-primary))'
    : 'rgb(var(--c-secondary))';

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-mono" style={{ color: 'var(--col-body)' }}>{name}</span>
        <span className="text-xs font-mono font-semibold" style={{ color: col }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(var(--c-primary)/0.10)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${col}99, ${col})` }}
          initial={{ width: 0 }}
          animate={{ width: inView ? `${pct}%` : 0 }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}

const cVar = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const kVar = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };

export default function Skills() {
  const { data } = useData();
  const cats = data.skills || [];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  return (
    <section id="skills" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3"
          style={{ color: 'var(--col-heading)' }}>
          Skills &amp; Technologies
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-12 md:mb-14"
          style={{ background: 'linear-gradient(90deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))' }} />
      </motion.div>

      <motion.div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        variants={cVar} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
        {cats.map((cat, ci) => (
          <motion.div key={cat.name + ci} variants={kVar}
            className="glass rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-1.5 h-4 rounded-full"
                style={{ background: ci % 2 === 0 ? 'rgb(var(--c-primary))' : 'rgb(var(--c-secondary))' }} />
              <h3 className="font-display text-sm font-bold"
                style={{ color: 'var(--col-heading)' }}>
                {cat.name}
              </h3>
            </div>
            {(cat.skills || []).map((sk, si) => (
              <SkillBar key={sk.name + si} name={sk.name} pct={sk.pct}
                colorIdx={ci} inView={inView} delay={ci * 0.05 + si * 0.08} />
            ))}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
