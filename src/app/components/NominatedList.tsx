"use client";
import { useShallow } from "zustand/shallow";
import { useSessionStore } from "../store/sessionStore";
import { GameRow } from "./GameRow";

export default function NominatedList() {
  const { nominated, unNominate } = useSessionStore(useShallow((s) => ({ nominated: s.nominated, unNominate: s.unNominate })));
  if (!nominated.length) return <p className="text-sm text-gray-500">No nominations yet.</p>;
  return (
    <div className="space-y-2">
      {nominated.map((g) => (
        <GameRow key={g.id} g={g} right={<button onClick={() => unNominate(g.id)} className="text-xs px-2 py-1 rounded-md border">← Remove</button>} />)
      )}
    </div>
  );
}