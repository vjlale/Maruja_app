'use client';
import { useState } from 'react';

/**
 * Logo de Maruja.
 * - Si existe /brand/logo-m.png lo muestra (el logo dorado 3D real).
 * - Si el archivo no está, cae automáticamente al wordmark "MARUJA" con
 *   degradé dorado metálico (clase .gold-text) en fuente display.
 *
 * Apenas se suba el PNG a /public/brand/logo-m.png, aparece solo sin tocar código.
 */
export function MarujaLogo({
  className = '',
  imgClassName = '',
  textClassName = '',
  alt = 'Maruja',
}: {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  alt?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <span className={`gold-text font-display font-black select-none ${textClassName} ${className}`}>
        MARUJA
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-m.png"
      alt={alt}
      onError={() => setImgFailed(true)}
      className={`select-none object-contain ${imgClassName} ${className}`}
      draggable={false}
    />
  );
}
