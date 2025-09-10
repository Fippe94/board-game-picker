"use client";
import type { Game } from "../lib/types";
import { useSessionStore } from "../store/sessionStore";
import { useShallow } from "zustand/shallow";

export function GameRow({ g, right }: { g: Game; right: React.ReactNode }) {
  
    const isNominated = useSessionStore().isNominated;
    var colorName = isNominated(g.id) ? "green" : "white";
    var className = `flex items-center justify-between rounded-xl border bg-${colorName} p-2`
  return (
    <div className={className} style={{ backgroundColor: isNominated(g.id) ? "green" : "white"}}>
      <div>
        <p className="text-sm font-medium">{g.title}</p>
        <p className="text-[11px] text-gray-500">{g.minPlayers}–{g.maxPlayers} players {g.time ? `• ${g.time} min` : ""}</p>
      </div>
      {right}
    </div>
  );
}