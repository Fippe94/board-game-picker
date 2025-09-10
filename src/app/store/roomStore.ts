"use client";
import { create } from "zustand";
import type { Game } from "../lib/types";

type RoomStore = {
  roomId: string | null;
  connected: boolean;
  available: Game[];
  nominated: Game[];
  isNominated: (id:string) => boolean;
  setRoom: (id: string | null) => void;
  setConnected: (v: boolean) => void;
  setSnapshot: (snap: { available: Game[]; nominated: Game[] }) => void;
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomId: null,
  connected: false,
  available: [],
  nominated: [],
    isNominated: (id) => {
    const nominated = get().nominated;
    return nominated.some(x => x.id === id);
    },
  setRoom: (id) => set({ roomId: id }),
  setConnected: (v) => set({ connected: v }),
  setSnapshot: (snap) => set({ available: snap.available, nominated: snap.nominated }),
}));