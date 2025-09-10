"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(rtUrl: string) {
  if (!socket) {
    socket = io(rtUrl, { transports: ["websocket"] });
  }
  return socket;
}