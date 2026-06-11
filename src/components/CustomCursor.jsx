import { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isMobile, setIsMobile] = useState(true);
  const [visible, setVisible]   = useState(false);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ring follows with a springy lag
  const ringX = useSpring(mouseX, { damping: 28, stiffness: 300, mass: 0.4 });
  const ringY = useSpring(mouseY, { damping: 28, stiffness: 300, mass: 0.4 });

  // Detect mobile / touch device
  useEffect(() => {
    const check = () => setIsMobile(
      window.innerWidth < 768 || window.matchMedia('(pointer:coarse)').matches
    );
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Hide default cursor on desktop
  useEffect(() => {
    if (isMobile) { document.body.style.cursor = ''; return; }
    const id = 'cursor-hide-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = '*, *::before, *::after { cursor: none !important; }';
      document.head.appendChild(s);
    }
    return () => {
      document.body.style.cursor = '';
      document.getElementById(id)?.remove();
    };
  }, [isMobile]);

  // Track mouse
  const onMove    = useCallback((e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); setVisible(true); }, [mouseX, mouseY]);
  const onEnter   = useCallback((e) => { if (e.target.closest('a,button,[role=button],input,textarea,select')) setHovering(true);  }, []);
  const onLeave   = useCallback((e) => { if (e.target.closest('a,button,[role=button],input,textarea,select')) setHovering(false); }, []);
  const onExitDoc = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (isMobile) return;
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover',    onEnter);
    document.addEventListener('mouseout',     onLeave);
    document.addEventListener('mouseleave',   onExitDoc);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  onEnter);
      document.removeEventListener('mouseout',   onLeave);
      document.removeEventListener('mouseleave', onExitDoc);
    };
  }, [isMobile, onMove, onEnter, onLeave, onExitDoc]);

  if (isMobile) return null;

  return (
    <>
      {/* ── Small solid dot — snaps exactly to cursor ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}>
        <motion.div
          className="rounded-full"
          animate={{
            width:   hovering ? 5 : 8,
            height:  hovering ? 5 : 8,
            opacity: visible  ? 1 : 0,
          }}
          transition={{ duration: 0.12 }}
          style={{ background: 'rgb(var(--c-primary))' }}
        />
      </motion.div>

      {/* ── Larger ring — lags behind with spring ── */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}>
        <motion.div
          className="rounded-full border-2"
          animate={{
            width:       hovering ? 44 : 32,
            height:      hovering ? 44 : 32,
            opacity:     visible ? (hovering ? 0.7 : 0.4) : 0,
            borderColor: hovering
              ? 'rgb(var(--c-secondary))'
              : 'rgb(var(--c-primary))',
            scale: hovering ? 1.15 : 1,
          }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        />
      </motion.div>
    </>
  );
}
