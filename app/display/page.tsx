'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/lib/socket-client';
import { useVoteUrl } from '@/lib/vote-url';
import { Confetti } from '@/components/Confetti';
import { QRCodeSVG } from 'qrcode.react';

const SONG_COLORS = ['#a855f7', '#ec4899', '#06b6d4', '#f97316'];
const SONG_LABELS = ['A', 'B', 'C', 'D'];

export default function DisplayPage() {
  const { state } = useSocket();
  const voteUrl = useVoteUrl();

  // Hide cursor in display window (for OBS capture)
  useEffect(() => {
    document.body.style.cursor = 'none';
    document.documentElement.style.overflow = 'hidden';
    return () => { document.body.style.cursor = ''; };
  }, []);

  const { songs, votes, status, timeRemaining, durationSec, winnerId, totalVotes } = state;
  const timerPct = durationSec > 0 ? timeRemaining / durationSec : 1;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timerStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const winner = songs.find(s => s.id === winnerId);
  const maxVotes = Math.max(...votes.map(v => v.count), 1);

  return (
    <div
      className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at center, #0d0520 0%, #06030f 70%)',
        fontFamily: 'Arial Black, Arial, sans-serif',
      }}
    >
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(80px)' }} />

      <AnimatePresence mode="wait">

        {/* ═══ IDLE ═══ */}
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-12"
            >
              <h1
                className="text-[160px] font-black tracking-[0.15em] leading-none select-none"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmer 3s linear infinite',
                  filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.6))',
                }}
              >
                MARUJA
              </h1>
            </motion.div>

            <div className="flex flex-col items-center gap-8">
              {/* QR Code */}
              <motion.div
                className="p-5 rounded-3xl"
                style={{ background: 'white', boxShadow: '0 0 60px rgba(168,85,247,0.8)' }}
                animate={{ boxShadow: ['0 0 40px rgba(168,85,247,0.6)', '0 0 80px rgba(168,85,247,1)', '0 0 40px rgba(168,85,247,0.6)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <QRCodeSVG value={voteUrl} size={220} />
              </motion.div>

              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">Escaneá para votar</p>
                <p className="text-xl text-purple-300 tracking-widest">{voteUrl}</p>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-8 flex gap-3">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: SONG_COLORS[i % 4] }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ VOTING ═══ */}
        {status === 'voting' && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col px-20 py-12"
          >
            {/* Top bar: title + timer */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1
                  className="text-7xl font-black tracking-widest"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  MARUJA
                </h1>
                <p className="text-purple-300 text-2xl tracking-widest uppercase font-bold">
                  ¿Cuál es la próxima?
                </p>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 136 136">
                    <circle cx="68" cy="68" r="58" fill="none" stroke="#1a0a2e" strokeWidth="10" />
                    <circle
                      cx="68" cy="68" r="58" fill="none"
                      stroke={timerPct > 0.3 ? '#a855f7' : '#ef4444'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 58}`}
                      strokeDashoffset={`${2 * Math.PI * 58 * (1 - timerPct)}`}
                      style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{timerStr}</span>
                  </div>
                </div>
                <p className="text-purple-400 text-lg font-bold mt-1">{totalVotes} votos</p>
              </div>
            </div>

            {/* Vote bars */}
            <div className="flex-1 flex flex-col gap-5 justify-center">
              {songs.map((song, i) => {
                const color = SONG_COLORS[i % 4];
                const vote = votes.find(v => v.songId === song.id);
                const pct = vote ? vote.percentage : 0;
                const count = vote ? vote.count : 0;
                const barPct = maxVotes > 0 ? (count / maxVotes) * 100 : 0;

                return (
                  <div key={song.id} className="flex items-center gap-6">
                    {/* Label */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
                      style={{ background: `${color}33`, border: `3px solid ${color}`, color }}
                    >
                      {SONG_LABELS[i]}
                    </div>

                    {/* Song info + bar */}
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <div>
                          <span className="text-white font-bold text-2xl">{song.title}</span>
                          <span className="text-gray-400 text-lg ml-3">{song.artist}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black" style={{ color }}>{pct}%</span>
                          <span className="text-gray-400 text-xl">{count}</span>
                        </div>
                      </div>
                      <div
                        className="w-full h-10 rounded-full overflow-hidden"
                        style={{ background: `${color}22` }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${color}99, ${color})`,
                            boxShadow: `0 0 20px ${color}88`,
                          }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${Math.max(barPct, 1)}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: QR hint */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="p-2 bg-white rounded-xl">
                <QRCodeSVG value={voteUrl} size={60} />
              </div>
              <div>
                <p className="text-purple-300 text-lg font-bold">Escaneá y votá ahora</p>
                <p className="text-purple-500 text-sm">{voteUrl}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ REVEALING ═══ */}
        {status === 'revealing' && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.h1
              className="text-8xl font-black text-white mb-8"
              animate={{ scale: [1, 1.05, 0.98, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.8))' }}
            >
              Contando votos...
            </motion.h1>

            {/* Suspense bars */}
            <div className="w-full max-w-3xl px-20 flex flex-col gap-4">
              {songs.map((song, i) => {
                const color = SONG_COLORS[i % 4];
                const vote = votes.find(v => v.songId === song.id);
                const pct = vote ? vote.percentage : 0;
                return (
                  <motion.div
                    key={song.id}
                    className="flex items-center gap-4"
                    animate={{ x: [0, -8, 8, -5, 5, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  >
                    <span className="text-2xl font-black w-20 text-right" style={{ color }}>
                      {SONG_LABELS[i]}
                    </span>
                    <div className="flex-1 h-8 rounded-full overflow-hidden" style={{ background: `${color}22` }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
                        animate={{ width: [`${pct}%`, `${Math.min(pct + 15, 100)}%`, `${pct}%`] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                    </div>
                    <span className="text-2xl font-bold" style={{ color }}>???</span>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-purple-400 text-2xl mt-10 tracking-widest">{totalVotes} votos en total</p>
          </motion.div>
        )}

        {/* ═══ WINNER ═══ */}
        {status === 'winner' && winner && (
          <motion.div
            key="winner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <Confetti />

            {/* Winner badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="text-center"
            >
              <motion.p
                className="text-3xl font-bold tracking-[0.4em] uppercase mb-4"
                style={{ color: '#eab308' }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ★ GANADORA ★
              </motion.p>

              <motion.h1
                className="font-black leading-none mb-4 text-center"
                style={{
                  fontSize: 'clamp(60px, 10vw, 140px)',
                  background: 'linear-gradient(135deg, #ffffff, #a855f7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.9))',
                  textShadow: 'none',
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {winner.title}
              </motion.h1>

              <motion.p
                className="text-4xl font-bold"
                style={{ color: '#a855f7' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {winner.artist}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 px-8 py-3 rounded-full text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  boxShadow: '0 0 40px rgba(168,85,247,0.6)',
                }}
              >
                {(() => {
                  const winnerVote = votes.find(v => v.songId === winner.id);
                  return `${winnerVote?.count ?? 0} votos — ${winnerVote?.percentage ?? 0}%`;
                })()}
              </motion.div>
            </motion.div>

            {/* Bottom results */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 flex gap-8"
            >
              {songs.filter(s => s.id !== winner.id).map((song, i) => {
                const color = SONG_COLORS[(songs.indexOf(song)) % 4];
                const vote = votes.find(v => v.songId === song.id);
                return (
                  <div key={song.id} className="text-center">
                    <p className="text-lg font-bold text-gray-400">{song.title}</p>
                    <p className="text-2xl font-black" style={{ color }}>{vote?.percentage ?? 0}%</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
