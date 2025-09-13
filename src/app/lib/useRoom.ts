"use client";
import { useEffect, useRef, useState } from 'react';
import { getSocket } from "./socketSingleton";
import { useRoomStore } from "../store/roomStore";
import { Socket } from 'socket.io-client';
import router from 'next/router';
import { useUserStore } from '../store/userStore';

export function useRoom(rtUrl: string, initialRoom?: string, playerName: string = "") {
  const socketRef = useRef<Socket | null>(null);
  const setSnapshot = useRoomStore((s) => s.setSnapshot);
  const setRoom = useRoomStore((s) => s.setRoom);
  const setConnected = useRoomStore((s) => s.setConnected);
  const player = playerName;
  useEffect(() => {
    const s = getSocket(rtUrl);
    socketRef.current = s;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("room:snapshot", (snap) => setSnapshot(snap));
    s.on("room:created", (id: string) => {
      setRoom(id);
    });
    if (initialRoom && player){
      joinRoom(initialRoom);
    }

    return () => {
      // do not disconnect the singleton here if other components still use it
      s.off("connect"); s.off("disconnect"); s.off("room:snapshot"); s.off("room:created");
    };
  }, [rtUrl, initialRoom, setSnapshot, setRoom, setConnected, player]);
  
  // Actions
  const createRoom   = () => socketRef.current?.emit("room:create", player);
  const joinRoom     = (id: string) => { setRoom(id); socketRef.current?.emit("room:join", id, player); };
  const addAvailable = (g: { title: string; minPlayers?: number; maxPlayers?: number; time?: number }) =>
                        socketRef.current?.emit("game:addAvailable", g);
  const nominate     = (id: string) => socketRef.current?.emit("game:nominate", id);
  const unnominate   = (id: string) => socketRef.current?.emit("game:unnominate", id);
  const reset        = () => socketRef.current?.emit("room:reset");

  return { createRoom, joinRoom, addAvailable, nominate, unnominate, reset };
}