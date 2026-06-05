'use client';

/**
 * Fondo con el patrón "trama" de Maruja (rosa o verde) tileado a baja opacidad,
 * sobre el degradé oscuro de base. Decorativo, no interactivo.
 */
export function TramaBackground({
  variant = 'rosa',
  opacity = 0.07,
  size = 360,
}: {
  variant?: 'rosa' | 'verde';
  opacity?: number;
  size?: number;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url(/brand/trama-${variant}.png)`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${size}px auto`,
        opacity,
        mixBlendMode: 'screen',
      }}
    />
  );
}
