import { motion } from 'framer-motion';
import { Briefcase, GraduationCap } from 'lucide-react';
import { useData } from '../context/DataContext';

function Entry({ e, i, isPrimary }) {
  const Icon = e.points ? Briefcase : GraduationCap;
  const col  = isPrimary ? 'rgb(var(--c-primary))' : 'rgb(var(--c-secondary))';

  return (
    <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: i * 0.1 }}
      className="relative pl-10 pb-8 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10"
        style={{ borderColor: col, background: 'rgb(var(--c-bg))' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: col }} />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4" style={{ color: col }} />
          <span className="text-xs font-mono font-medium" style={{ color: col }}>{e.date}</span>
        </div>
        <h3 className="font-display font-bold text-base mb-1"
          style={{ color: 'var(--col-heading)' }}>{e.role}</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--col-muted)' }}>{e.org}</p>
        {e.points && (
          <ul className="space-y-1.5">
            {e.points.map((pt, j) => (
              <li key={j} className="text-sm flex items-start gap-2"
                style={{ color: 'var(--col-body)' }}>
                <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: col }} />
                {pt}
              </li>
            ))}
          </ul>
        )}
        {e.detail && (
          <p className="text-sm font-mono" style={{ color: 'var(--col-muted)' }}>{e.detail}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const { data } = useData();
  const exp = data.experience || { work: [], education: [] };

  return (
    <section id="experience" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl mb-3"
          style={{ color: 'var(--col-heading)' }}>
          Experience &amp; Education
        </h2>
        <span className="block h-[3px] w-14 rounded-full mt-3 mb-12 md:mb-14"
          style={{ background: 'linear-gradient(90deg, rgb(var(--c-primary)), rgb(var(--c-secondary)))' }} />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <h3 className="font-display text-lg font-semibold mb-6"
            style={{ color: 'var(--col-heading)' }}>
            Work Experience
          </h3>
          <div className="relative ml-2.5"
            style={{ borderLeft: '2px solid rgba(var(--c-primary)/0.25)' }}>
            {(exp.work || []).map((e, i) => (
              <Entry key={e.id || i} e={e} i={i} isPrimary={true} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold mb-6"
            style={{ color: 'var(--col-heading)' }}>
            Education
          </h3>
          <div className="relative ml-2.5"
            style={{ borderLeft: '2px solid rgba(var(--c-secondary)/0.25)' }}>
            {(exp.education || []).map((e, i) => (
              <Entry key={e.id || i} e={e} i={i} isPrimary={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
