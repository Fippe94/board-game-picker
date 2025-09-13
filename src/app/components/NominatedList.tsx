"use client";
import { useShallow } from "zustand/shallow";
import { useRoomStore } from "../store/roomStore";
import { roomActions } from "../lib/roomActions";
import { GameRow } from "./GameRow";
import { useUserStore } from "../store/userStore";

export default function NominatedList() {
  const nominated = useRoomStore().nominated;
  const isNominated = useRoomStore().isNominated;
  if (!nominated.length) return <p className="text-sm text-gray-500">No nominations yet.</p>;
  return (
    <div className="space-y-2">
      {nominated.map((g) => (
        <GameRow key={g.id} g={g} condition={isNominated} eventTrue={() => roomActions.unNominate(g.id)} eventFalse={() => roomActions.nominate(g.id)} />)
      )}
    </div>
  );
}