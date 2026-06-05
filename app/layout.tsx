import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maruja — Votación en Vivo',
  description: 'Votá por tu canción favorita en la fiesta Maruja',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" style={{ background: '#06030f' }}>
      <body style={{ background: '#06030f', margin: 0, padding: 0, minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
