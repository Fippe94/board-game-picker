"use client";
import { create } from "zustand";
import type { Game, Player } from "../lib/types";

type RoomStore = {
  roomId: string | null;
  connected: boolean;
  available: Game[];
  nominated: Game[];
  players: Map<string,Player>;
  isNominated: (id:string) => boolean;
  isAvailable: (id:string) => boolean;
  setRoom: (id: string | null) => void;
  setConnected: (v: boolean) => void;
  setSnapshot: (snap: { available: Game[]; nominated: Game[], players: Player[] }) => void;
};

function convertToMap(array: Player[]){
  const map = new Map<string,Player>();
  array.forEach(player => {
    map.set(player.id, player);
  });
  return map;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomId: null,
  connected: false,
  available: [],
  nominated: [],
  players: new Map<string, Player>(),
  isNominated: (id) => {
    const nominated = get().nominated;
    return nominated.some(x => x.id === id);
  },
  isAvailable: (id) => {
    const available = get().available;
    return available.some(x => x.id === id);
  },
  setRoom: (id) => set({ roomId: id }),
  setConnected: (v) => set({ connected: v }),
  setSnapshot: (snap) => {console.log('snap: ' + snap.players.length); set({ available: snap.available, nominated: snap.nominated, players: convertToMap(snap.players) })},
}));