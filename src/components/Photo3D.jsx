import { Suspense, useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Glow texture helper ────────────────────────────────────────────── */
function makeGlowTex(size = 256, r, g, b) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0,   `rgba(${r},${g},${b},0.30)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.10)`);
  grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return Object.assign(new THREE.CanvasTexture(c), { needsUpdate: true });
}

/* ── Orbiting particles ─────────────────────────────────────────────── */
function Particles() {
  const ref = useRef();
  const positions = useMemo(() => {
    const a = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 1.8 + Math.random() * 2.2;
      a[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      a[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      a[i*3+2] = r * Math.cos(phi) - 0.5;
    }
    return a;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.018;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.012) * 0.06;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#3ef2d0" size={0.013} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

/* ── Glow planes ────────────────────────────────────────────────────── */
function Glows() {
  const cyanTex   = useMemo(() => makeGlowTex(256, 62, 242, 208), []);
  const violetTex = useMemo(() => makeGlowTex(256, 124, 92, 255), []);
  return (
    <>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[5, 6]} />
        <meshBasicMaterial map={cyanTex} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.6, -0.5, -1.2]} rotation={[0,0,0.3]}>
        <planeGeometry args={[4, 5]} />
        <meshBasicMaterial map={violetTex} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

/* ── Parallax image — pure CSS layer, no shader needed ─────────────── */
function ParallaxPhoto({ mouse }) {
  const ref = useRef(null);

  useEffect(() => {
    let raf;
    let curX = 0, curY = 0;
    const animate = () => {
      curX += (mouse.current.x - curX) * 0.06;
      curY += (mouse.current.y - curY) * 0.06;
      if (ref.current) {
        ref.current.style.transform = `
          perspective(800px)
          rotateY(${curX * 14}deg)
          rotateX(${-curY * 10}deg)
          translateY(${Math.sin(Date.now() / 1300) * 7}px)
        `;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 flex items-end justify-center pb-0"
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      <img
        src="/me.png"
        alt="Mohammed Anas Khan"
        className="h-full object-contain object-bottom select-none pointer-events-none"
        style={{
          /* Screen blend removes the white background natively — no shader needed */
          mixBlendMode: 'screen',
          filter: 'contrast(1.08) brightness(1.04)',
          maskImage: 'linear-gradient(to top, transparent 0%, black 12%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 12%, black 90%, transparent 100%)',
        }}
        draggable={false}
      />
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────────────── */
export default function Photo3D() {
  const mouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const onMove = useCallback((e) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    mouse.current.x = ((e.clientX - r.left) / r.width)  * 2 - 1;
    mouse.current.y = ((e.clientY - r.top)  / r.height) * 2 - 1;
  }, []);

  const onLeave = useCallback(() => {
    mouse.current.x = 0;
    mouse.current.y = 0;
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* Layer 1: R3F canvas — particles + glow (purely decorative, transparent bg) */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Glows />
          <Particles />
        </Canvas>
      </div>

      {/* Layer 2: Actual photo — CSS mix-blend-mode:screen removes white bg */}
      <ParallaxPhoto mouse={mouse} />
    </div>
  );
}
