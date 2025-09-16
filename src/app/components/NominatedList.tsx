"use client";
import { useRoomStore } from "../store/roomStore";
import { roomActions } from "../lib/roomActions";
import { GameRow } from "./GameRow";

export default function NominatedList() {
  const nominated = useRoomStore((s) => s.nominated);
  const isNominated = useRoomStore((s) => s.isNominated);
  const phase = useRoomStore((s) => s.phase);
  if (!nominated.length) return <p className="text-sm text-gray-500">No nominations yet.</p>;
  const actionsDisabled = phase !== "nomination";
  return (
    <div className="space-y-2">
      {nominated.map((g) => (
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
