export type SessionStatus = 'idle' | 'voting' | 'revealing' | 'winner';

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
}

export interface VoteCount {
  songId: string;
  count: number;
  percentage: number;
}

export interface SessionState {
  status: SessionStatus;
  songs: Song[];
  votes: VoteCount[];
  timeRemaining: number;
  durationSec: number;
  winnerId?: string;
  totalVotes: number;
}
