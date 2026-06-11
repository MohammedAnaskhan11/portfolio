import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

/* ═══════════════════════════════════════════════════════════════
   Neural Network Canvas Background
   - Nodes drift slowly across viewport
   - Edges drawn between nearby nodes (distance-based opacity)
   - Random activations cascade through the network as signals
   - Fully theme-aware (violet/cyan dark, blue/emerald light)
═══════════════════════════════════════════════════════════════ */

const NODE_COUNT   = 65;   // total drifting nodes
const CONNECT_DIST = 160;  // px — max dist to draw edge
const NODE_SPEED   = 0.28; // max drift speed (px/frame)
const PULSE_EVERY  = 900;  // ms — how often a random node activates

class NeuralNode {
  constructor(w, h) {
    this.reset(w, h);
  }
  reset(w, h) {
    this.x  = Math.random() * w;
    this.y  = Math.random() * h;
    this.vx = (Math.random() - 0.5) * NODE_SPEED * 2;
    this.vy = (Math.random() - 0.5) * NODE_SPEED * 2;
    this.r  = 1.5 + Math.random() * 2;
    this.glow   = 0;   // 0–1 active intensity
  }
  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    // Bounce off edges
    if (this.x < 0)   { this.x = 0;   this.vx = Math.abs(this.vx); }
    if (this.x > w)   { this.x = w;   this.vx = -Math.abs(this.vx); }
    if (this.y < 0)   { this.y = 0;   this.vy = Math.abs(this.vy); }
    if (this.y > h)   { this.y = h;   this.vy = -Math.abs(this.vy); }
    // Decay glow
    this.glow = Math.max(0, this.glow - 0.018);
  }
  activate() { this.glow = 1; }
}

class Signal {
  constructor(src, dst, colSignal) {
    this.src = src;
    this.dst = dst;
    this.t   = 0;              // 0→1 travel progress
    this.spd = 0.012 + Math.random() * 0.012;
    this.done    = false;
    this.colSignal = colSignal;
  }
  get x() { return this.src.x + (this.dst.x - this.src.x) * this.t; }
  get y() { return this.src.y + (this.dst.y - this.src.y) * this.t; }
  update() {
    this.t += this.spd;
    if (this.t >= 1) { this.t = 1; this.done = true; this.dst.activate(); }
  }
}

function getColors(dark) {
  return dark ? {
    nodeBase:   [139, 92, 246],   // violet
    nodeActive: [167, 139, 250],  // violet-400
    edge:       [139, 92, 246],
    signal:     [34,  211, 238],  // cyan
  } : {
    nodeBase:   [37,  99,  235],  // blue-600
    nodeActive: [99,  152, 255],  // blue-400
    edge:       [37,  99,  235],
    signal:     [5,   150, 105],  // emerald-600
  };
}

export default function BackgroundFX() {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const darkRef   = useRef(dark);

  useEffect(() => { darkRef.current = dark; }, [dark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, dpr;
    const nodes   = [];
    const signals = [];

    function resize() {
      dpr    = Math.min(window.devicePixelRatio || 1, 2);
      W      = window.innerWidth;
      H      = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) nodes.push(new NeuralNode(W, H));
    }

    // ── Random activation cascade ──────────────────────────────────
    let lastPulse = 0;
    function maybeActivate(ts) {
      if (ts - lastPulse < PULSE_EVERY) return;
      lastPulse = ts;
      // Pick a random source node
      const src = nodes[Math.floor(Math.random() * nodes.length)];
      src.activate();
      // Find 1–3 nearby nodes to send signals to
      const C = getColors(darkRef.current);
      nodes
        .filter(n => n !== src)
        .map(n => ({ n, d: Math.hypot(n.x - src.x, n.y - src.y) }))
        .filter(({ d }) => d < CONNECT_DIST)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .forEach(({ n }) => signals.push(new Signal(src, n, C.signal)));
    }

    // ── Draw loop ──────────────────────────────────────────────────
    function draw(ts) {
      rafRef.current = requestAnimationFrame(draw);
      const C = getColors(darkRef.current);

      ctx.clearRect(0, 0, W, H);
      maybeActivate(ts);

      // Update nodes
      nodes.forEach(n => n.update(W, H));

      // Remove done signals
      for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].update();
        if (signals[i].done) signals.splice(i, 1);
      }

      // ── Draw edges ──────────────────────────────────────────────
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > CONNECT_DIST) continue;

          const proximity = 1 - d / CONNECT_DIST;
          const activeBoost = Math.max(a.glow, b.glow) * 0.5;
          const alpha = (proximity * 0.12 + activeBoost * 0.2) * (darkRef.current ? 1 : 0.7);

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${C.edge[0]},${C.edge[1]},${C.edge[2]},${alpha})`;
          ctx.lineWidth   = proximity * 0.9;
          ctx.stroke();
        }
      }

      // ── Draw signal dots ────────────────────────────────────────
      signals.forEach(sig => {
        const trail = 6;
        for (let t = 0; t < trail; t++) {
          const frac = 1 - t / trail;
          const px   = sig.src.x + (sig.dst.x - sig.src.x) * Math.max(0, sig.t - t * 0.015);
          const py   = sig.src.y + (sig.dst.y - sig.src.y) * Math.max(0, sig.t - t * 0.015);
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * frac, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sig.colSignal[0]},${sig.colSignal[1]},${sig.colSignal[2]},${frac * 0.85})`;
          ctx.fill();
        }
        // Glow halo at signal head
        const grd = ctx.createRadialGradient(sig.x, sig.y, 0, sig.x, sig.y, 9);
        grd.addColorStop(0, `rgba(${sig.colSignal[0]},${sig.colSignal[1]},${sig.colSignal[2]},0.35)`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(sig.x, sig.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // ── Draw nodes ──────────────────────────────────────────────
      nodes.forEach(n => {
        const glow  = n.glow;
        const alpha = 0.30 + glow * 0.55;
        const r     = n.r + glow * 3;

        // Glow halo when active
        if (glow > 0.05) {
          const haloR = r + 10 * glow;
          const grd   = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
          const col   = glow > 0.5 ? C.nodeActive : C.nodeBase;
          grd.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${glow * 0.35})`);
          grd.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Node dot
        const col = glow > 0.5 ? C.nodeActive : C.nodeBase;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
        ctx.fill();
      });
    }

    init();
    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []); // Only run once — theme changes handled via darkRef

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
