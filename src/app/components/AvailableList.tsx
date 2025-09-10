"use client";
import { useShallow } from "zustand/shallow";
import { useSessionStore } from "../store/sessionStore";
import { GameRow } from "./GameRow";

export default function AvailableList() {
  const { available, nominate, isNominated } = useSessionStore(useShallow((s) => ({ available: s.available, nominate: s.nominate, isNominated:s.isNominated })));
  if (!available.length) return <p className="text-sm text-gray-500">No games yet. Add one below.</p>;
  return (
    <div className="space-y-2">
      {available.map((g) => (
        <GameRow key={g.id} g={g} right={<button onClick={() => { if (!isNominated(g.id)) nominate(g.id)}} className="text-xs px-2 py-1 rounded-md border">Nominate →</button>} />
      ))}
    </div>
  );
}