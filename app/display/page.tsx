'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/lib/socket-client';
import { useVoteUrl } from '@/lib/vote-url';
import { Confetti } from '@/components/Confetti';
import { MarujaLogo } from '@/components/MarujaLogo';
import { TramaBackground } from '@/components/TramaBackground';
import { PopDecor } from '@/components/PopDecor';
import { QRCodeSVG } from 'qrcode.react';

const SONG_COLORS = ['#E12FBE', '#5FE88E', '#E8B84A', '#F0654F'];
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
      className="w-screen h-screen overflow-hidden relative flex flex-col font-serif-pf"
      style={{ background: 'radial-gradient(ellipse at center, #150826 0%, #06030f 72%)' }}
    >
      {/* Background grid decoration */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(225,47,190,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(225,47,190,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #E12FBE, transparent)', filter: 'blur(90px)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #5FE88E, transparent)', filter: 'blur(90px)' }} />

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
            <TramaBackground variant="rosa" opacity={0.06} />
            <PopDecor scene="display" />

            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-10 z-10"
              style={{ filter: 'drop-shadow(0 0 50px rgba(225,47,190,0.45))' }}
            >
              <MarujaLogo
                imgClassName="h-[230px] w-auto"
                textClassName="text-[150px] tracking-[0.12em] leading-none"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-8 z-10">
              {/* QR Code */}
              <motion.div
                className="p-5 rounded-3xl"
                style={{ background: 'white', boxShadow: '0 0 60px rgba(225,47,190,0.8)' }}
                animate={{ boxShadow: ['0 0 40px rgba(225,47,190,0.6)', '0 0 90px rgba(232,201,106,0.9)', '0 0 40px rgba(225,47,190,0.6)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {voteUrl && <QRCodeSVG value={voteUrl} size={220} />}
              </motion.div>

              <div className="text-center">
                <p className="text-5xl font-display font-bold text-white mb-2">Escaneá para votar</p>
                <p className="text-xl text-gold-light tracking-widest font-serif-pf">{voteUrl}</p>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-8 flex gap-3 z-10">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
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
            <TramaBackground variant="verde" opacity={0.05} />
            <PopDecor scene="displayEdges" />

            {/* Top bar: title + timer */}
            <div className="flex items-center justify-between mb-10 z-10">
              <div>
                <MarujaLogo
                  imgClassName="h-20 w-auto"
                  textClassName="text-7xl tracking-widest"
                />
                <p className="text-gold-light text-2xl tracking-widest uppercase font-bold font-display mt-1">
                  ¿Cuál es la próxima?
                </p>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 136 136">
                    <circle cx="68" cy="68" r="58" fill="none" stroke="#2a0f3e" strokeWidth="10" />
                    <circle
                      cx="68" cy="68" r="58" fill="none"
                      stroke={timerPct > 0.3 ? 'var(--color-magenta)' : '#ef4444'}
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
                <p className="text-gold text-lg font-bold mt-1">{totalVotes} votos</p>
              </div>
            </div>

            {/* Vote bars */}
            <div className="flex-1 flex flex-col gap-5 justify-center z-10">
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
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0 font-display"
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
            <div className="flex items-center justify-center gap-4 mt-8 z-10">
              <div className="p-2 bg-white rounded-xl">
                {voteUrl && <QRCodeSVG value={voteUrl} size={60} />}
              </div>
              <div>
                <p className="text-gold-light text-lg font-bold">Escaneá y votá ahora</p>
                <p className="text-magenta text-sm">{voteUrl}</p>
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
            <TramaBackground variant="rosa" opacity={0.05} />

            {/* Spinning disco ball for suspense */}
            <motion.img
              src="/brand/bola-boliche.png"
              alt="Bola de boliche"
              className="w-48 h-auto mb-8 object-contain"
              style={{ filter: 'drop-shadow(0 0 40px rgba(225,47,190,0.7))' }}
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.8, repeat: Infinity } }}
            />

            <motion.h1
              className="text-8xl font-black text-white mb-8 font-display"
              animate={{ scale: [1, 1.05, 0.98, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ filter: 'drop-shadow(0 0 30px rgba(225,47,190,0.8))' }}
            >
              Contando votos...
            </motion.h1>

            {/* Suspense bars */}
            <div className="w-full max-w-3xl px-20 flex flex-col gap-4 z-10">
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
                    <span className="text-2xl font-black w-20 text-right font-display" style={{ color }}>
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

            <p className="text-gold-light text-2xl mt-10 tracking-widest">{totalVotes} votos en total</p>
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
            <TramaBackground variant="rosa" opacity={0.06} />
            <PopDecor scene="displayEdges" />

            {/* Winner badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="text-center z-10"
            >
              <motion.p
                className="text-3xl font-bold tracking-[0.4em] uppercase mb-4 font-display"
                style={{ color: '#E8C96A' }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ★ GANADORA ★
              </motion.p>

              <motion.h1
                className="font-black leading-none mb-4 text-center font-display"
                style={{
                  fontSize: 'clamp(60px, 10vw, 140px)',
                  background: 'linear-gradient(135deg, #ffffff, #E8C96A, #E12FBE)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(225,47,190,0.9))',
                  textShadow: 'none',
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {winner.title}
              </motion.h1>

              <motion.p
                className="text-4xl font-bold"
                style={{ color: 'var(--color-magenta)' }}
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
                className="mt-8 px-8 py-3 rounded-full text-2xl font-bold inline-block"
                style={{
                  background: 'linear-gradient(135deg, #E12FBE, #E8C96A)',
                  boxShadow: '0 0 40px rgba(225,47,190,0.6)',
                  color: '#1a0a14',
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
              className="absolute bottom-10 flex gap-8 z-10"
            >
              {songs.filter(s => s.id !== winner.id).map((song) => {
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
