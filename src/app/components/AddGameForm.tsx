"use client";
import { useState } from "react";
import { roomActions } from "../lib/roomActions";
import { Game } from "../lib/types"

export default function AddGameForm({submitMethod, buttonText}: {submitMethod: (g: Game) => void, buttonText: string}) {
  const [title, setTitle] = useState("");
  const [minPlayers, setMin] = useState(1);
  const [maxPlayers, setMax] = useState(4);
  const [time, setTime] = useState<number | "">("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    let game : Game = { id: title.trim(), title: title.trim(), minPlayers: Number(minPlayers), maxPlayers: Number(maxPlayers), time: time ? Number(time) : undefined }
    submitMethod(game);
    setTitle("");
    setTime("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Game title" className="px-3 py-2 border rounded-lg" />
        <input value={time} onChange={(e) => setTime(e.target.value as unknown as number)} placeholder="Time (min)" className="px-3 py-2 border rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={minPlayers} onChange={(e) => setMin(parseInt(e.target.value))} placeholder="Min players" className="px-3 py-2 border rounded-lg" />
        <input type="number" value={maxPlayers} onChange={(e) => setMax(parseInt(e.target.value))} placeholder="Max players" className="px-3 py-2 border rounded-lg" />
      </div>
      <button type="submit" className="px-3 py-2 rounded-xl bg-black text-white w-full">{buttonText}</button>
    </form>
  );
}