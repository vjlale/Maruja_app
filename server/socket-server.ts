import { Server as SocketServer } from 'socket.io';
import type { SessionState, Song, VoteCount } from '../lib/types';

let sessionState: SessionState = {
  status: 'idle',
  songs: [],
  votes: [],
  timeRemaining: 60,
  durationSec: 60,
  totalVotes: 0,
};

const voterIds = new Set<string>();
const rawVotes = new Map<string, number>();
let timerInterval: ReturnType<typeof setInterval> | null = null;
let ioInstance: SocketServer | null = null;

function broadcast() {
  ioInstance?.emit('state:sync', sessionState);
}

function computeVotes(songs: Song[]): VoteCount[] {
  const total = Array.from(rawVotes.values()).reduce((a, b) => a + b, 0);
  return songs.map(song => ({
    songId: song.id,
    count: rawVotes.get(song.id) ?? 0,
    percentage: total > 0 ? Math.round(((rawVotes.get(song.id) ?? 0) / total) * 100) : 0,
  }));
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function revealWinner() {
  const maxVotes = Math.max(...sessionState.votes.map(v => v.count), 0);
  const winner = sessionState.votes.find(v => v.count === maxVotes);
  sessionState.status = 'revealing';
  sessionState.winnerId = winner?.songId;
  broadcast();

  setTimeout(() => {
    sessionState.status = 'winner';
    broadcast();
  }, 4000);
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    sessionState.timeRemaining = Math.max(0, sessionState.timeRemaining - 1);
    broadcast();
    if (sessionState.timeRemaining <= 0) {
      stopTimer();
      revealWinner();
    }
  }, 1000);
}

export function initSocketServer(io: SocketServer) {
  ioInstance = io;

  io.on('connection', socket => {
    socket.emit('state:sync', sessionState);

    socket.on('admin:configure', ({ songs, durationSec }: { songs: Song[]; durationSec: number }) => {
      if (sessionState.status !== 'idle') return;
      sessionState.songs = songs;
      sessionState.durationSec = durationSec;
      sessionState.timeRemaining = durationSec;
      rawVotes.clear();
      songs.forEach(s => rawVotes.set(s.id, 0));
      sessionState.votes = computeVotes(songs);
      broadcast();
    });

    socket.on('admin:start', () => {
      if (sessionState.status !== 'idle' || sessionState.songs.length === 0) return;
      voterIds.clear();
      rawVotes.clear();
      sessionState.songs.forEach(s => rawVotes.set(s.id, 0));
      sessionState.status = 'voting';
      sessionState.timeRemaining = sessionState.durationSec;
      sessionState.votes = computeVotes(sessionState.songs);
      sessionState.totalVotes = 0;
      sessionState.winnerId = undefined;
      broadcast();
      startTimer();
    });

    socket.on('admin:reveal', () => {
      if (sessionState.status !== 'voting') return;
      stopTimer();
      revealWinner();
    });

    socket.on('admin:reset', () => {
      stopTimer();
      voterIds.clear();
      rawVotes.clear();
      sessionState.songs.forEach(s => rawVotes.set(s.id, 0));
      sessionState = {
        status: 'idle',
        songs: sessionState.songs,
        votes: computeVotes(sessionState.songs),
        timeRemaining: sessionState.durationSec,
        durationSec: sessionState.durationSec,
        totalVotes: 0,
      };
      broadcast();
    });

    socket.on('vote:cast', ({ songId, voterId }: { songId: string; voterId: string }) => {
      if (sessionState.status !== 'voting') return;
      if (voterIds.has(voterId)) return;
      if (!rawVotes.has(songId)) return;
      voterIds.add(voterId);
      rawVotes.set(songId, (rawVotes.get(songId) ?? 0) + 1);
      sessionState.totalVotes = voterIds.size;
      sessionState.votes = computeVotes(sessionState.songs);
      broadcast();
    });
  });
}
