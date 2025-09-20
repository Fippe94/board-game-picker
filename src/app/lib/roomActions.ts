"use client";
import { getSocket } from "./socketSingleton";
import { Game } from "./types";
import { getRealtimeUrl } from "./realtimeConfig";

const RT_URL = getRealtimeUrl();

export const roomActions = {
  addAvailable: (g: Game) =>
    getSocket(RT_URL).emit("game:addAvailable", g),
  nominate: (id: string) => getSocket(RT_URL).emit("game:nominate", id),
  unNominate: (id: string) => getSocket(RT_URL).emit("game:unnominate", id),
  setReady: (ready: boolean) => getSocket(RT_URL).emit("player:setReady", ready),
  submitVote: (order: string[]) => getSocket(RT_URL).emit("vote:submit", order),
  reset: () => getSocket(RT_URL).emit("room:reset"),
};
