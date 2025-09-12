"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UserStore = {
  nickname?: string;
  setNickname: (n: string) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      nickname: undefined,
      setNickname: (n) => set({ nickname: n }),
    }),
    {
      name: "board-picker-session",
      // Avoid touching storage on the server; only in the browser.
      storage: createJSONStorage(() => (localStorage)),
    }));