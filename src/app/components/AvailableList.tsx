"use client";
import { useShallow } from "zustand/shallow";
import { useRoomStore } from "../store/roomStore";
import { GameRow } from "./GameRow";
import { roomActions } from "../lib/roomActions";

export default function AvailableList() {
  const { available, isNominated, phase } = useRoomStore(
    useShallow((s) => ({ available: s.available, isNominated: s.isNominated, phase: s.phase }))
  );
  if (!available.length) {
    return <p className="text-sm text-gray-500">No games yet. Add one below.</p>;
  }
  const actionsDisabled = phase !== "nomination";
  return (
    <div className="space-y-2">
      {available.map((g) => (
        <GameRow
          key={g.id}
          g={g}
          condition={isNominated}
          eventTrue={() => roomActions.unNominate(g.id)}
          eventFalse={() => roomActions.nominate(g.id)}
          disabled={actionsDisabled}
        />
      ))}
      {actionsDisabled && (
        <p className="text-[11px] text-gray-500">Voting in progress. Nominations are locked.</p>
      )}
    </div>
  );
}
