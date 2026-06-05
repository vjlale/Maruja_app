import type { Metadata } from 'next';
import { Cinzel_Decorative, Playfair_Display } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Maruja — Votación en Vivo',
  description: 'Votá por tu canción favorita en la fiesta Maruja',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${playfair.variable}`} style={{ background: '#06030f' }}>
      <body style={{ background: '#06030f', margin: 0, padding: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
