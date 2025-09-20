"use client";
import { getSocket } from "./socketSingleton";
import { Game } from "./types";

const RT_URL = process.env.NEXT_PUBLIC_RT_URL || "http://161.35.43.235:3030";

export const roomActions = {
  addAvailable: (g: Game) =>
    getSocket(RT_URL).emit("game:addAvailable", g),
  nominate: (id: string) => getSocket(RT_URL).emit("game:nominate", id),
  unNominate: (id: string) => getSocket(RT_URL).emit("game:unnominate", id),
  setReady: (ready: boolean) => getSocket(RT_URL).emit("player:setReady", ready),
  submitVote: (order: string[]) => getSocket(RT_URL).emit("vote:submit", order),
  reset: () => getSocket(RT_URL).emit("room:reset"),
};
