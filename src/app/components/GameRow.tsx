"use client";
import type { Game } from "../lib/types";
import { useRoomStore } from "../store/roomStore";

export function GameRow({ g, condition = () => false, eventTrue = () => null, eventFalse = () => null}: { g: Game; condition?: (id: string) => boolean, eventTrue? : (id:string) => (void),  eventFalse? : (id:string) => (void)}) {
  
  const isNominated = useRoomStore().isNominated;
    var colorName = condition(g.id) ? "green" : "white";
    var className = `flex items-center justify-between rounded-xl border bg-${colorName} p-2`
  return (
    <div className={className} style={{ backgroundColor: condition(g.id) ? "lightgreen" : "white"}} onClick={() => condition(g.id) ? eventTrue(g.id) : eventFalse(g.id)}>
      <div>
        <p className="text-sm font-medium">{g.title}</p>
        <p className="text-[11px] text-gray-500">{g.minPlayers}–{g.maxPlayers} players {g.time ? `• ${g.time} min` : ""} {g.nominator && isNominated(g.id) ? '• nominated by ' + g.nominator : ''}</p>
      </div>
    </div>
  );
}