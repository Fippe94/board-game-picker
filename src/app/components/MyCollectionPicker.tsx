"use client";
import { useSessionStore } from "../store/sessionStore";
import { roomActions } from "../lib/roomActions";
import { GameRow } from "./GameRow";
import { useRoomStore } from "../store/roomStore";

export default function MyCollectionPicker() {
  const myCollection = useSessionStore((s) => s.myCollection);
  const isAvailable = useRoomStore((s) => s.isAvailable);
  const phase = useRoomStore((s) => s.phase);
  if (!myCollection.length) return <p className="text-sm text-gray-500">No games in your collection yet.</p>;
  const actionsDisabled = phase !== "nomination";
  return (
    <div className="space-y-2">
      {myCollection.map((g) => (
        <GameRow
          key={g.id}
          g={g}
          condition={isAvailable}
          eventFalse={() => roomActions.addAvailable(g)}
          disabled={actionsDisabled}
        />
      ))}
      {actionsDisabled && (
        <p className="text-[11px] text-gray-500">Voting in progress. Additions are paused.</p>
      )}
    </div>
  );
}
