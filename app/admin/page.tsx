'use client';
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '@/lib/socket-client';
import { useVoteUrl } from '@/lib/vote-url';
import { MarujaLogo } from '@/components/MarujaLogo';
import { QRCodeSVG } from 'qrcode.react';
import type { Song } from '@/lib/types';

const SONG_COLORS = ['#E12FBE', '#5FE88E', '#E8B84A', '#F0654F'];
const DEFAULT_SONGS: Song[] = [
  { id: '1', title: '', artist: '', coverUrl: '' },
  { id: '2', title: '', artist: '', coverUrl: '' },
  { id: '3', title: '', artist: '', coverUrl: '' },
  { id: '4', title: '', artist: '', coverUrl: '' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    idle: { label: 'En espera', color: '#6b7280' },
    voting: { label: 'VOTANDO', color: '#E12FBE' },
    revealing: { label: 'Revelando', color: '#E8C96A' },
    winner: { label: 'GANADOR', color: '#C9A84C' },
  };
  const s = map[status] ?? map.idle;
  return (
    <span
      className="px-4 py-1 rounded-full text-sm font-bold"
      style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}66` }}
    >
      {s.label}
    </span>
  );
}

export default function AdminPage() {
  const { state, socket, connected } = useSocket();
  const voteUrl = useVoteUrl();
  const [songs, setSongs] = useState<Song[]>(DEFAULT_SONGS);
  const [duration, setDuration] = useState(60);
  const [configured, setConfigured] = useState(false);

  const updateSong = useCallback((index: number, field: keyof Song, value: string) => {
    setSongs(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }, []);

  const configure = useCallback(() => {
    if (!socket.current) return;
    const validSongs = songs.map(s => ({
      ...s,
      title: s.title || `Canción ${s.id}`,
      artist: s.artist || 'Artista',
    }));
    socket.current.emit('admin:configure', { songs: validSongs, durationSec: duration });
    setConfigured(true);
  }, [socket, songs, duration]);

  const start = useCallback(() => socket.current?.emit('admin:start'), [socket]);
  const reveal = useCallback(() => socket.current?.emit('admin:reveal'), [socket]);
  const reset = useCallback(() => {
    socket.current?.emit('admin:reset');
    setConfigured(false);
  }, [socket]);

  const openDisplay = useCallback(() => {
    window.open('/display', 'maruja-display',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
  }, []);

  const { status, votes, totalVotes, timeRemaining, songs: activeSongs } = state;
  const maxVotes = Math.max(...votes.map(v => v.count), 1);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className="min-h-screen p-6 font-serif-pf"
      style={{ background: '#06030f', color: 'white' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MarujaLogo
            imgClassName="h-12 w-auto"
            textClassName="text-3xl tracking-widest"
          />
          <span className="text-gray-400 text-xl font-normal font-display">Panel del DJ</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">{connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <StatusBadge status={status} />
          <button
            onClick={openDisplay}
            className="px-4 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #E12FBE, #E8C96A)',
              color: '#1a0a14',
              boxShadow: '0 0 20px rgba(225,47,190,0.4)',
            }}
          >
            Abrir Display
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Song Configuration */}
        <div
          className="rounded-2xl p-6"
          style={{ background: '#0d0520', border: '1px solid rgba(225,47,190,0.2)' }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Configurar Canciones</h2>

          <div className="flex flex-col gap-4">
            {songs.map((song, i) => {
              const color = SONG_COLORS[i];
              return (
                <div
                  key={song.id}
                  className="rounded-xl p-4"
                  style={{ background: `${color}11`, border: `1px solid ${color}44` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: `${color}33`, color }}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-bold" style={{ color }}>Canción {i + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Título"
                      value={song.title}
                      onChange={e => updateSong(i, 'title', e.target.value)}
                      disabled={status !== 'idle'}
                      className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 disabled:opacity-50"
                      style={{
                        background: '#06030f',
                        border: `1px solid ${color}44`,
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Artista"
                      value={song.artist}
                      onChange={e => updateSong(i, 'artist', e.target.value)}
                      disabled={status !== 'idle'}
                      className="rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 disabled:opacity-50"
                      style={{ background: '#06030f', border: `1px solid ${color}44` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timer slider */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-gold-light">Tiempo de votación</label>
              <span className="text-sm font-bold text-white">
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')} min
              </span>
            </div>
            <input
              type="range"
              min={15}
              max={180}
              step={15}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              disabled={status !== 'idle'}
              className="w-full disabled:opacity-50"
              style={{ accentColor: '#E12FBE' }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 seg</span>
              <span>3 min</span>
            </div>
          </div>

          <button
            onClick={configure}
            disabled={status !== 'idle'}
            className="w-full mt-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #9B1B5A, #E12FBE)' }}
          >
            Aplicar Configuración
          </button>

          {configured && status === 'idle' && (
            <p className="text-center text-green-400 text-sm mt-2">¡Configuración aplicada!</p>
          )}
        </div>

        {/* RIGHT: Controls + Live Preview + QR */}
        <div className="flex flex-col gap-6">

          {/* Controls */}
          <div
            className="rounded-2xl p-6"
            style={{ background: '#0d0520', border: '1px solid rgba(225,47,190,0.2)' }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Controles</h2>

            {status !== 'idle' && (
              <div className="flex items-center justify-center gap-3 mb-4 p-3 rounded-xl"
                style={{ background: '#06030f' }}>
                <span className="text-4xl font-black text-white">{timerStr}</span>
                <span className="text-gold">{totalVotes} votos</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={start}
                disabled={status !== 'idle' || !configured}
                className="w-full py-4 rounded-xl font-black text-xl text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #5FE88E, #2BA85E)', color: '#06291a', boxShadow: '0 0 20px rgba(95,232,142,0.35)' }}
              >
                Iniciar Votación
              </button>

              <button
                onClick={reveal}
                disabled={status !== 'voting'}
                className="w-full py-4 rounded-xl font-black text-xl text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #E8C96A, #C9A84C)', color: '#1a0a14', boxShadow: '0 0 20px rgba(201,168,76,0.35)' }}
              >
                Revelar Ganador
              </button>

              <button
                onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-lg text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #4b5563, #374151)' }}
              >
                Reiniciar
              </button>
            </div>
          </div>

          {/* Live Preview */}
          {(status === 'voting' || status === 'revealing' || status === 'winner') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5"
              style={{ background: '#0d0520', border: '1px solid rgba(225,47,190,0.2)' }}
            >
              <h2 className="text-lg font-bold text-white mb-3">Resultados en Vivo</h2>
              <div className="flex flex-col gap-3">
                {activeSongs.map((song, i) => {
                  const color = SONG_COLORS[i % 4];
                  const vote = votes.find(v => v.songId === song.id);
                  const pct = vote?.percentage ?? 0;
                  const count = vote?.count ?? 0;
                  const barPct = maxVotes > 0 ? (count / maxVotes) * 100 : 0;
                  const isWinner = state.winnerId === song.id;

                  return (
                    <div key={song.id} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: `${color}33`, color }}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`font-bold ${isWinner ? 'text-gold' : 'text-white'}`}>
                            {song.title} {isWinner ? '🏆' : ''}
                          </span>
                          <span style={{ color }}>{pct}% ({count})</span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: `${color}22` }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            animate={{ width: `${Math.max(barPct, 1)}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* QR + URL */}
          <div
            className="rounded-2xl p-5 flex items-center gap-5"
            style={{ background: '#0d0520', border: '1px solid rgba(225,47,190,0.2)' }}
          >
            <div className="bg-white p-2 rounded-xl flex-shrink-0">
              {voteUrl && <QRCodeSVG value={voteUrl} size={80} />}
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-1">URL de votación</p>
              <p className="text-gold-light text-sm font-mono break-all">{voteUrl}</p>
              <p className="text-gray-500 text-xs mt-2">
                Mostrá este QR en pantalla o usá el display
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
