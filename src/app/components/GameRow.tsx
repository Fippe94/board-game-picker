"use client";
import type { Game } from "../lib/types";
import { useRoomStore } from "../store/roomStore";

export function GameRow({ g, right, colorCondition = () => false }: { g: Game; right: React.ReactNode, colorCondition?: (id: string) => boolean }) {
  
  const isNominated = useRoomStore().isNominated;
    var colorName = colorCondition(g.id) ? "green" : "white";
    var className = `flex items-center justify-between rounded-xl border bg-${colorName} p-2`
  return (
    <div className={className} style={{ backgroundColor: colorCondition(g.id) ? "lightgreen" : "white"}}>
      <div>
        <p className="text-sm font-medium">{g.title}</p>
        <p className="text-[11px] text-gray-500">{g.minPlayers}–{g.maxPlayers} players {g.time ? `• ${g.time} min` : ""} {g.nominator && isNominated(g.id) ? '• nominated by ' + g.nominator : ''}</p>
      </div>
      {right}
    </div>
  );
}