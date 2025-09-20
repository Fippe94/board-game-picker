"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Game } from "../lib/types";

export type SessionState = {
  myCollection: Game[];
  addToMyCollection: (g: Game) => void;
  updateMyCollection: (id: string, updated: Game) => void;
  removeFromMyCollection: (id: string) => void;
};

const toGame = (game: Game): Game => {
  const trimmedTitle = game.title?.trim() || game.id;
  return {
    ...game,
    id: trimmedTitle,
    title: trimmedTitle,
  };
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      myCollection: [],
      addToMyCollection: (game) =>
        set((state) => {
          const nextGame = toGame(game);
          const existingIndex = state.myCollection.findIndex((g) => g.id === nextGame.id);
          if (existingIndex !== -1) {
            const nextCollection = [...state.myCollection];
            nextCollection[existingIndex] = {
              ...nextCollection[existingIndex],
              ...nextGame,
            };
            return { myCollection: nextCollection };
          }
          return { myCollection: [...state.myCollection, nextGame] };
        }),
      updateMyCollection: (id, updated) =>
        set((state) => ({
          myCollection: state.myCollection.map((game) =>
            game.id === id ? toGame({ ...game, ...updated }) : game
          ),
        })),
      removeFromMyCollection: (id) =>
        set((state) => ({
          myCollection: state.myCollection.filter((game) => game.id !== id),
        })),
    }),
    {
      name: "board-picker-collection",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

