'use client';
import { useEffect, useState } from 'react';

/**
 * Devuelve la URL que se muestra en el código QR para votar.
 *
 * Prioridad:
 *  1. Si está definida NEXT_PUBLIC_VOTE_URL en el build, usa ese valor.
 *  2. Si no, detecta automáticamente el host desde el navegador
 *     (window.location.origin + '/vote').
 *
 * Gracias a la opción 2, podés desplegar en cualquier IP o dominio sin
 * tener que reconstruir la app: el QR apunta solo a donde estés accediendo.
 */
export function useVoteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_VOTE_URL;
  const [url, setUrl] = useState(envUrl ?? '');

  useEffect(() => {
    if (!envUrl && typeof window !== 'undefined') {
      setUrl(`${window.location.origin}/vote`);
    }
  }, [envUrl]);

  return url;
}
