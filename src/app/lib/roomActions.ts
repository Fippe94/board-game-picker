"use client";
import { getSocket } from "./socketSingleton";
import { useRoom } from "./useRoom";

const RT_URL = process.env.NEXT_PUBLIC_RT_URL || "http://localhost:3030";


export const roomActions = {
  addAvailable: (g: { title: string; minPlayers?: number; maxPlayers?: number; time?: number }) =>
    getSocket(RT_URL).emit("game:addAvailable", g),
  nominate: (id: string, user?: string) => getSocket(RT_URL).emit("game:nominate", id, user),
  unNominate: (id: string, user?: string) => getSocket(RT_URL).emit("game:unnominate", id, user),
  reset: () => getSocket(RT_URL).emit("room:reset"),
};