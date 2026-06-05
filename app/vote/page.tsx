'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/lib/socket-client';
import { MarujaLogo } from '@/components/MarujaLogo';
import { TramaBackground } from '@/components/TramaBackground';
import { PopDecor } from '@/components/PopDecor';
import type { Song } from '@/lib/types';

const SONG_COLORS = [
  { border: '#E12FBE', glow: 'rgba(225,47,190,0.5)' },
  { border: '#5FE88E', glow: 'rgba(95,232,142,0.45)' },
  { border: '#E8B84A', glow: 'rgba(232,184,74,0.45)' },
  { border: '#F0654F', glow: 'rgba(240,101,79,0.45)' },
];

function getVoterId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('maruja_voter_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('maruja_voter_id', id);
  }
  return id;
}

export default function VotePage() {
  const { state, socket } = useSocket();
  const [voted, setVoted] = useState<string | null>(null);
  const [voterId, setVoterId] = useState('');

  useEffect(() => {
    setVoterId(getVoterId());
    const savedVote = localStorage.getItem('maruja_last_vote_session');
    // Reset vote if session restarted (idle means new session possible)
  }, []);

  // Reset vote when session goes back to idle or starts new voting
  useEffect(() => {
    if (state.status === 'idle') {
      setVoted(null);
    }
  }, [state.status]);

  const castVote = useCallback((song: Song) => {
    if (voted || state.status !== 'voting' || !socket.current) return;
    socket.current.emit('vote:cast', { songId: song.id, voterId });
    setVoted(song.id);
  }, [voted, state.status, socket, voterId]);

  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const timerPct = state.durationSec > 0 ? state.timeRemaining / state.durationSec : 1;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between p-4 relative overflow-hidden font-serif-pf"
      style={{ background: 'linear-gradient(180deg, #06030f 0%, #150826 50%, #06030f 100%)' }}
    >
      <TramaBackground variant="rosa" opacity={0.05} />
      <PopDecor scene="vote" />

      {/* Header */}
      <div className="w-full flex flex-col items-center pt-4 pb-2 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MarujaLogo
            imgClassName="h-16 w-auto"
            textClassName="text-5xl tracking-[0.15em]"
          />
        </motion.div>
        <p className="text-gold-light text-sm mt-1 tracking-widest uppercase font-display">Votación en Vivo</p>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
        <AnimatePresence mode="wait">

          {/* IDLE state */}
          {state.status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center px-6"
            >
              <div className="text-7xl mb-6 float-anim">💋</div>
              <h2 className="text-2xl font-bold text-white mb-3 font-display">La fiesta empieza pronto</h2>
              <p className="text-gold-light text-lg">Esperá la señal del DJ para votar por tu canción favorita</p>
            </motion.div>
          )}

          {/* VOTING state */}
          {state.status === 'voting' && (
            <motion.div
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* Timer */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20 mb-2">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#2a0f3e" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="34" fill="none"
                      stroke={timerPct > 0.3 ? '#E12FBE' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerPct)}`}
                      style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {timerStr}
                  </span>
                </div>
                <p className="text-gold-light text-sm tracking-wider uppercase font-display">
                  {voted ? '¡Voto registrado!' : '¿Cuál querés escuchar?'}
                </p>
              </div>

              {/* Song cards */}
              <div className="grid grid-cols-1 gap-3 w-full">
                {state.songs.map((song, i) => {
                  const col = SONG_COLORS[i % SONG_COLORS.length];
                  const isVoted = voted === song.id;
                  const isOther = voted && voted !== song.id;

                  return (
                    <motion.button
                      key={song.id}
                      onClick={() => castVote(song)}
                      disabled={!!voted}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{
                        opacity: isOther ? 0.35 : 1,
                        x: 0,
                        scale: isVoted ? 1.03 : 1,
                      }}
                      transition={{ delay: i * 0.08 }}
                      whileTap={!voted ? { scale: 0.96 } : {}}
                      className={`relative w-full rounded-2xl p-4 text-left overflow-hidden`}
                      style={{
                        background: `linear-gradient(135deg, ${col.border}33, #0d0520)`,
                        border: `2px solid ${isVoted ? col.border : col.border + '66'}`,
                        boxShadow: isVoted ? `0 0 30px ${col.glow}` : 'none',
                        cursor: voted ? 'default' : 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                          style={{ background: `${col.border}33`, border: `1px solid ${col.border}44` }}
                        >
                          {isVoted ? '✓' : String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-base truncate">{song.title}</p>
                          <p className="text-sm truncate" style={{ color: col.border }}>{song.artist}</p>
                        </div>
                        {isVoted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-2xl"
                          >
                            🎶
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {!voted && (
                <p className="text-center text-magenta text-xs mt-4">
                  Solo podés votar una vez
                </p>
              )}
            </motion.div>
          )}

          {/* REVEALING state */}
          {state.status === 'revealing' && (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-6"
            >
              <motion.div
                className="text-6xl mb-6"
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🪩
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2 font-display">Contando votos...</h2>
              <p className="text-gold-light">{state.totalVotes} votos registrados</p>
            </motion.div>
          )}

          {/* WINNER state */}
          {state.status === 'winner' && (
            <motion.div
              key="winner"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center px-4"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🏆
              </motion.div>
              <p className="text-gold-light text-sm uppercase tracking-widest mb-2 font-display">¡Ganadora!</p>
              {(() => {
                const winner = state.songs.find(s => s.id === state.winnerId);
                return winner ? (
                  <>
                    <h2 className="text-3xl font-black text-white mb-1 font-display">{winner.title}</h2>
                    <p className="text-lg" style={{ color: '#E12FBE' }}>{winner.artist}</p>
                  </>
                ) : null;
              })()}
              <p className="text-gold text-sm mt-4">{state.totalVotes} votos en total</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="py-3 text-center z-10">
        <p className="text-magenta-deep text-xs font-display tracking-widest">MARUJA</p>
      </div>
    </div>
  );
}
