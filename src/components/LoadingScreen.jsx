import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Neural network node positions (% of viewport)
   Arranged in a loose multi-layer structure
───────────────────────────────────────────────────────────── */
const NODES = [
  // Input layer
  { id: 0,  x: 8,  y: 20 }, { id: 1,  x: 8,  y: 45 }, { id: 2,  x: 8,  y: 70 },
  // Hidden 1
  { id: 3,  x: 22, y: 12 }, { id: 4,  x: 22, y: 32 }, { id: 5,  x: 22, y: 55 }, { id: 6,  x: 22, y: 78 },
  // Hidden 2
  { id: 7,  x: 38, y: 18 }, { id: 8,  x: 38, y: 40 }, { id: 9,  x: 38, y: 62 }, { id: 10, x: 38, y: 85 },
  // Hidden 3
  { id: 11, x: 62, y: 15 }, { id: 12, x: 62, y: 38 }, { id: 13, x: 62, y: 60 }, { id: 14, x: 62, y: 82 },
  // Hidden 4
  { id: 15, x: 78, y: 22 }, { id: 16, x: 78, y: 45 }, { id: 17, x: 78, y: 68 },
  // Output
  { id: 18, x: 92, y: 32 }, { id: 19, x: 92, y: 58 },
];

const EDGES = [
  [0,3],[0,4],[1,4],[1,5],[2,5],[2,6],[1,3],[2,4],
  [3,7],[3,8],[4,7],[4,8],[4,9],[5,8],[5,9],[5,10],[6,9],[6,10],
  [7,11],[7,12],[8,11],[8,12],[8,13],[9,12],[9,13],[9,14],[10,13],[10,14],
  [11,15],[11,16],[12,15],[12,16],[13,16],[13,17],[14,16],[14,17],
  [15,18],[15,19],[16,18],[16,19],[17,18],[17,19],
];

/* ─────────────────────────────────────────────────────────────
   Tech tags — 8 items orbiting at r=195–215px
───────────────────────────────────────────────────────────── */
const TECH_TAGS = [
  { text: 'Python',       angle: -90,   r: 200, cyan: false },
  { text: 'PyTorch',      angle: -45,   r: 215, cyan: true  },
  { text: 'OpenCV',       angle: 0,     r: 205, cyan: false },
  { text: 'Deep Learning',angle: 45,    r: 218, cyan: true  },
  { text: 'React',        angle: 90,    r: 200, cyan: false },
  { text: 'NeRF',         angle: 135,   r: 212, cyan: true  },
  { text: 'LLM',          angle: 180,   r: 205, cyan: false },
  { text: 'Computer Vision', angle: 225, r: 215, cyan: true },
  { text: 'Scikit-learn', angle: 270,   r: 200, cyan: false },
];

/* ─────────────────────────────────────────────────────────────
   Math/code symbols — inner ring at r≈120px
───────────────────────────────────────────────────────────── */
const SYMBOLS = [
  { char: '</>',  angle: -70,  r: 125 },
  { char: '{ }',  angle: 20,   r: 120 },
  { char: '∑',    angle: 110,  r: 128 },
  { char: 'λ',    angle: 200,  r: 122 },
  { char: '∇',    angle: 290,  r: 118 },
  { char: '⊗',    angle: 340,  r: 132 },
];

function deg2rad(d) { return (d * Math.PI) / 180; }
function polar(deg, r) {
  return { x: Math.cos(deg2rad(deg)) * r, y: Math.sin(deg2rad(deg)) * r };
}

/* Positions child at (x,y) pixels from screen center */
function Anchor({ x, y, style = {}, children }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none',
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Neural Network SVG background
───────────────────────────────────────────────────────────── */
function NeuralNet() {
  const [active, setActive] = useState(new Set());

  // Randomly activate nodes
  useEffect(() => {
    const tick = () => {
      const n = Math.floor(Math.random() * NODES.length);
      setActive(prev => { const s = new Set(prev); s.add(n); return s; });
      setTimeout(() => setActive(prev => { const s = new Set(prev); s.delete(n); return s; }), 600);
    };
    const id = setInterval(tick, 180);
    return () => clearInterval(id);
  }, []);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <filter id="glow-blur">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {EDGES.map(([a, b], i) => {
        const na = NODES[a], nb = NODES[b];
        const isActive = active.has(a) || active.has(b);
        return (
          <line key={i}
            x1={`${na.x}%`} y1={`${na.y}%`}
            x2={`${nb.x}%`} y2={`${nb.y}%`}
            stroke={isActive ? 'rgba(139,92,246,0.55)' : 'rgba(139,92,246,0.08)'}
            strokeWidth={isActive ? 1 : 0.5}
            style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
          />
        );
      })}

      {/* Nodes */}
      {NODES.map(n => {
        const isActive = active.has(n.id);
        return (
          <g key={n.id}>
            {isActive && (
              <circle cx={`${n.x}%`} cy={`${n.y}%`} r="8"
                fill="rgba(139,92,246,0.15)" style={{ transition: 'r 0.3s' }} />
            )}
            <circle
              cx={`${n.x}%`} cy={`${n.y}%`} r={isActive ? 3.5 : 2}
              fill={isActive ? '#a78bfa' : 'rgba(139,92,246,0.35)'}
              filter={isActive ? 'url(#glow-blur)' : undefined}
              style={{ transition: 'all 0.3s ease' }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Animated gradient ring (decorative orbit path)
───────────────────────────────────────────────────────────── */
function OrbitRing({ r, opacity = 0.25, rotate = false, dashed = false }) {
  return (
    <motion.div
      animate={rotate ? { rotate: 360 } : undefined}
      transition={rotate ? { duration: 24, repeat: Infinity, ease: 'linear' } : undefined}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        width: r * 2, height: r * 2,
        transform: `translate(-50%, -50%)`,
        borderRadius: '50%',
        border: `1px ${dashed ? 'dashed' : 'solid'} rgba(139,92,246,${opacity})`,
        pointerEvents: 'none',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Main LoadingScreen
───────────────────────────────────────────────────────────── */
export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress value
    let raf;
    const start = performance.now();
    const dur = 2600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t1 = setTimeout(() => setPhase('hold'),  400);
    const t2 = setTimeout(() => setPhase('exit'),  3100);
    const t3 = setTimeout(() => onDone(),          3600);
    return () => {
      cancelAnimationFrame(raf);
      [t1, t2, t3].forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: '#04060f', overflow: 'hidden',
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {/* ── Grid ─────────────────────────────────────────────── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
                              linear-gradient(90deg,rgba(139,92,246,0.04) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }} />

          {/* ── Neural network (behind center) ───────────────────── */}
          <NeuralNet />

          {/* ── Central radial glow ──────────────────────────────── */}
          <motion.div
            animate={{ opacity: [0.18, 0.42, 0.18], scale: [1, 1.08, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 520, height: 520, borderRadius: '50%',
              transform: 'translate(-50%,-50%)',
              background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(34,211,238,0.06) 50%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Decorative orbit rings ───────────────────────────── */}
          <OrbitRing r={90}  opacity={0.30} />
          <OrbitRing r={155} opacity={0.18} dashed />
          <OrbitRing r={230} opacity={0.14} rotate />
          <OrbitRing r={300} opacity={0.07} />

          {/* ── Travelling dot on outer ring ─────────────────────── */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 460, height: 460,
              transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              width: 6, height: 6, borderRadius: '50%',
              background: '#22d3ee',
              boxShadow: '0 0 10px 3px rgba(34,211,238,0.6)',
              transform: 'translate(-50%,-50%)',
            }} />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 13, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 310, height: 310,
              transform: 'translate(-50%,-50%)',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: '50%',
              width: 5, height: 5, borderRadius: '50%',
              background: '#8b5cf6',
              boxShadow: '0 0 8px 3px rgba(139,92,246,0.6)',
              transform: 'translate(-50%,-50%)',
            }} />
          </motion.div>

          {/* ── Math / code symbols ──────────────────────────────── */}
          {SYMBOLS.map((s, i) => {
            const { x, y } = polar(s.angle, s.r);
            return (
              <Anchor key={i} x={x} y={y}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.65, 0.5, 0.65], scale: 1 }}
                  transition={{
                    opacity: { duration: 2.2, repeat: Infinity, delay: 0.5 + i * 0.12 },
                    scale:   { duration: 0.5, delay: 0.5 + i * 0.12, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{
                    display: 'block',
                    fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
                    color: 'rgba(167,139,250,0.75)',
                    textShadow: '0 0 16px rgba(139,92,246,0.7)',
                    userSelect: 'none',
                  }}
                >
                  {s.char}
                </motion.span>
              </Anchor>
            );
          })}

          {/* ── Tech tags ────────────────────────────────────────── */}
          {TECH_TAGS.map((tag, i) => {
            const { x, y } = polar(tag.angle, tag.r);
            return (
              <Anchor key={tag.text} x={x} y={y}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: 1, scale: 1,
                    y: [0, i % 2 === 0 ? -6 : 6, 0],
                  }}
                  transition={{
                    opacity: { duration: 0.45, delay: 0.7 + i * 0.08 },
                    scale:   { duration: 0.45, delay: 0.7 + i * 0.08, ease: [0.22, 1, 0.36, 1] },
                    y: { duration: 2.8 + i * 0.18, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 },
                  }}
                  style={{
                    fontFamily: 'monospace', fontSize: 11,
                    padding: '4px 11px', borderRadius: 999,
                    background: tag.cyan ? 'rgba(34,211,238,0.08)'  : 'rgba(139,92,246,0.10)',
                    border:     `1px solid ${tag.cyan ? 'rgba(34,211,238,0.30)' : 'rgba(139,92,246,0.30)'}`,
                    color:      tag.cyan ? 'rgba(103,232,249,0.95)' : 'rgba(167,139,250,0.95)',
                    boxShadow:  tag.cyan ? '0 0 12px rgba(34,211,238,0.14)' : '0 0 12px rgba(139,92,246,0.14)',
                    userSelect: 'none', whiteSpace: 'nowrap',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {tag.text}
                </motion.div>
              </Anchor>
            );
          })}

          {/* ── Center: MAK ──────────────────────────────────────── */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, zIndex: 20,
          }}>
            {/* MAK text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.65, y: 10 }}
              animate={{
                opacity: 1, scale: 1, y: 0,
                filter: [
                  'drop-shadow(0 0 10px rgba(139,92,246,0.6))',
                  'drop-shadow(0 0 32px rgba(34,211,238,0.8))',
                  'drop-shadow(0 0 10px rgba(139,92,246,0.6))',
                ],
              }}
              transition={{
                opacity: { duration: 0.7 },
                scale:   { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                filter:  { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
              }}
              style={{
                fontFamily: "'Clash Display', 'Sora', sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(68px, 14vw, 96px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 45%, #22d3ee 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                userSelect: 'none',
              }}
            >
              MAK
            </motion.div>

            {/* Role tagline */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.55 }}
              style={{
                fontFamily: 'monospace', fontSize: 11,
                letterSpacing: '0.24em', textTransform: 'uppercase',
                color: 'rgba(139,92,246,0.7)',
                userSelect: 'none',
              }}
            >
              AI &nbsp;·&nbsp; ML &nbsp;·&nbsp; Computer Vision
            </motion.p>

            {/* Progress bar */}
            <div style={{
              width: 148, height: 2, borderRadius: 99,
              background: 'rgba(139,92,246,0.12)', overflow: 'hidden', marginTop: 4,
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.6, ease: 'easeInOut', delay: 0.2 }}
                style={{ height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, #22d3ee, #8b5cf6)' }}
              />
            </div>

            {/* Progress percent */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                fontFamily: 'monospace', fontSize: 11,
                color: 'rgba(100,116,139,0.8)',
                letterSpacing: '0.08em',
                userSelect: 'none',
              }}
            >
              {progress}%
            </motion.span>

            {/* Name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{
                fontFamily: 'monospace', fontSize: 11,
                letterSpacing: '0.18em', marginTop: 2,
                color: 'rgba(100,116,139,0.65)',
                userSelect: 'none',
              }}
            >
              Mohammed Anas Khan
            </motion.p>
          </div>

          {/* ── Scan line ────────────────────────────────────────── */}
          <motion.div
            animate={{ top: ['-2%', '102%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
            style={{
              position: 'absolute', left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(34,211,238,0.4), rgba(139,92,246,0.3), transparent)',
              pointerEvents: 'none', zIndex: 5,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
