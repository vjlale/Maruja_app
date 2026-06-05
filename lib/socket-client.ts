'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SessionState } from './types';

const initialState: SessionState = {
  status: 'idle',
  songs: [],
  votes: [],
  timeRemaining: 60,
  durationSec: 60,
  totalVotes: 0,
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SessionState>(initialState);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('state:sync', (newState: SessionState) => setState(newState));

    return () => { socket.disconnect(); };
  }, []);

  return { state, connected, socket: socketRef };
}
