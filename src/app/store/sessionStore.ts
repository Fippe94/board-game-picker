"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Game } from "../lib/types";

export type SessionState = {
  available: Game[];
  nominated: Game[];
  myCollection: Game[];
  addToAvailable: (game: Game) => void;
  addManyToAvailable: (games: Game[]) => void;
  removeFromAvailable: (id: string) => void;
  nominate: (id: string) => void;
  unNominate: (id: string) => void;
  isNominated: (id:string) => boolean;
  addToMyCollection: (g: Game) => void;
  seedIfEmpty: () => void;
  resetAll: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      available: [],
      nominated: [],
      myCollection: [],

      addToAvailable: (game) => set((s) => ({ available: [...s.available, { ...game, id: game.id || uid() }] })),
      addManyToAvailable: (games) => set((s) => ({ available: [...s.available, ...games.map((g) => ({ ...g, id: g.id || uid() }))] })),
      removeFromAvailable: (id) => set((s) => ({ available: s.available.filter((g) => g.id !== id) })),

      nominate: (id) => {
        const { available, nominated } = get();
        const g = available.find((x) => x.id === id);
        if (!g) return;
        set({ nominated: [...nominated, g] });
      },
      unNominate: (id) => {
        const { available, nominated } = get();
        const g = nominated.find((x) => x.id === id);
        if (!g) return;
        set({ nominated: nominated.filter((x) => x.id !== id) });
      },
      isNominated: (id) => {
        const nominated = get().nominated;
        return nominated.some(x => x.id === id);
      },

      addToMyCollection: (g) => set((s) => ({ myCollection: [...s.myCollection, { ...g, id: g.id || uid() }] })),

      seedIfEmpty: () => {
        const { available, myCollection } = get();
        if (available.length || myCollection.length) return;
        const seed: Game[] = [
          { id: uid(), title: "Wingspan", minPlayers: 1, maxPlayers: 5, time: 70, tags: ["engine"] },
          { id: uid(), title: "Codenames", minPlayers: 2, maxPlayers: 8, time: 15, tags: ["party"] },
          { id: uid(), title: "Spirit Island", minPlayers: 1, maxPlayers: 4, time: 120, tags: ["co-op"] },
        ];
        const mine: Game[] = [
          { id: uid(), title: "7 Wonders", minPlayers: 3, maxPlayers: 7, time: 35 },
          { id: uid(), title: "Just One", minPlayers: 3, maxPlayers: 7, time: 20 },
        ];
        set({ available: seed, myCollection: mine });
      },

      resetAll: () => set({ available: [], nominated: [], myCollection: [] }),
    }),
    {
      name: "board-picker-session",
      // Avoid touching storage on the server; only in the browser.
      storage: createJSONStorage(() => (localStorage)),
    }
  )
);