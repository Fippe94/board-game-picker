"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Game } from "../lib/types";

export type SessionState = {
  myCollection: Game[];
  addToMyCollection: (g: Game) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      myCollection: [],

      addToMyCollection: (g) => set((s) => ({ myCollection: [...s.myCollection, g ]})),

    }),
    {
      name: "board-picker-session",
      // Avoid touching storage on the server; only in the browser.
      storage: createJSONStorage(() => (localStorage)),
    }
  )
);