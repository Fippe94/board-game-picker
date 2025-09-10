"use client";
import { useShallow } from "zustand/shallow";
import { useSessionStore } from "../store/sessionStore";
import { roomActions } from "../lib/roomActions";

export default function MyCollectionPicker() {
  const myCollection= useSessionStore().myCollection;
  if (!myCollection.length) return <p className="text-sm text-gray-500">No games in your collection yet.</p>;
  return (
    <div className="space-y-2">
      {myCollection.map((g) => (
        <div key={g.id} className="flex items-center justify-between border rounded-lg p-2 bg-white">
          <div>
            <p className="text-sm font-medium">{g.title}</p>
            <p className="text-[11px] text-gray-500">{g.minPlayers}–{g.maxPlayers} players {g.time ? `• ${g.time} min` : ""}</p>
          </div>
          <button onClick={() => roomActions.addAvailable(g)} className="text-xs px-2 py-1 rounded-md border">Add</button>
        </div>
      ))}
    </div>
  );
}