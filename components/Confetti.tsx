'use client';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

const COLORS = ['#a855f7', '#ec4899', '#06b6d4', '#eab308', '#22c55e', '#f97316', '#ffffff'];

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 3,
      rotation: Math.random() * 720,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--rotation)); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s infinite`,
            '--rotation': `${p.rotation}deg`,
            borderRadius: '2px',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
