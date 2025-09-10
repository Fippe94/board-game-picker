export type Game = {
  id: string;
  title: string;
  minPlayers?: number;
  maxPlayers?: number;
  time?: number; // minutes
  weight?: number; // 0..5 (optional for MVP)
  tags?: string[];
};