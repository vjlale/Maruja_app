'use client';
import { motion } from 'framer-motion';

type DecorItem = {
  src: string;
  alt: string;
  /** posición CSS (cualquiera de top/bottom/left/right en %, vw, px) */
  pos: React.CSSProperties;
  width: number; // en px (base 1080p para display)
  rotate?: number; // inclinación fija
  float?: number; // amplitud del flotado vertical
  spin?: boolean; // gira lento (bola de boliche)
  delay?: number;
  opacity?: number;
  flip?: boolean;
};

const SCENES: Record<string, DecorItem[]> = {
  // Pantalla LED — elementos protagonistas
  display: [
    { src: 'bola-boliche.png', alt: 'Bola de boliche', pos: { top: '4%', right: '6%' }, width: 200, spin: true, float: 10, opacity: 0.95 },
    { src: 'mano-copa.png', alt: 'Copa', pos: { bottom: '-2%', left: '3%' }, width: 230, rotate: -8, float: 14, delay: 0.5, opacity: 0.95 },
    { src: 'boca.png', alt: 'Labios', pos: { top: '10%', left: '5%' }, width: 150, rotate: -12, float: 16, delay: 1, opacity: 0.92 },
    { src: 'silla.png', alt: 'Silla', pos: { bottom: '6%', right: '5%' }, width: 170, rotate: 6, float: 12, delay: 0.8, opacity: 0.9 },
  ],
  // Display en estados con contenido central (votación) — más al borde
  displayEdges: [
    { src: 'bola-boliche.png', alt: 'Bola de boliche', pos: { top: '3%', right: '2%' }, width: 130, spin: true, float: 8, opacity: 0.85 },
    { src: 'boca.png', alt: 'Labios', pos: { bottom: '4%', left: '2%' }, width: 110, rotate: -10, float: 12, delay: 0.6, opacity: 0.8 },
  ],
  // Móvil — discreto
  vote: [
    { src: 'bola-boliche.png', alt: 'Bola de boliche', pos: { top: '8%', right: '-4%' }, width: 90, spin: true, float: 8, opacity: 0.7 },
    { src: 'boca.png', alt: 'Labios', pos: { bottom: '12%', left: '-3%' }, width: 80, rotate: -12, float: 10, delay: 0.7, opacity: 0.6 },
  ],
};

export function PopDecor({ scene = 'display' }: { scene?: keyof typeof SCENES }) {
  const items = SCENES[scene] ?? SCENES.display;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((it, i) => (
        <motion.img
          key={i}
          src={`/brand/${it.src}`}
          alt={it.alt}
          draggable={false}
          className="absolute object-contain select-none"
          style={{
            ...it.pos,
            width: it.width,
            opacity: it.opacity ?? 0.9,
            scaleX: it.flip ? -1 : 1,
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
          }}
          animate={
            it.spin
              ? { rotate: 360 }
              : { y: [0, -(it.float ?? 10), 0], rotate: it.rotate ?? 0 }
          }
          transition={
            it.spin
              ? { duration: 18, repeat: Infinity, ease: 'linear' }
              : { duration: 4 + (it.delay ?? 0), repeat: Infinity, ease: 'easeInOut', delay: it.delay ?? 0 }
          }
        />
      ))}
    </div>
  );
}
