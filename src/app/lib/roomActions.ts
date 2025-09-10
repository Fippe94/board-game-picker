"use client";
import { getSocket } from "./socketSingleton";

const RT_URL = process.env.NEXT_PUBLIC_RT_URL || "http://localhost:3030";

export const roomActions = {
  createRoom: () => getSocket(RT_URL).emit("room:create"),
  joinRoom: (id: string) => getSocket(RT_URL).emit("room:join", id),
  addAvailable: (g: { title: string; minPlayers?: number; maxPlayers?: number; time?: number }) =>
    getSocket(RT_URL).emit("game:addAvailable", g),
  nominate: (id: string) => getSocket(RT_URL).emit("game:nominate", id),
  unNominate: (id: string) => getSocket(RT_URL).emit("game:unnominate", id),
  reset: () => getSocket(RT_URL).emit("room:reset"),
};