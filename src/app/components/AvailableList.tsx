"use client";
import { useShallow } from "zustand/shallow";
import { useRoomStore } from "../store/roomStore";
import { GameRow } from "./GameRow";
import { roomActions } from "../lib/roomActions";
import { useUserStore } from "../store/userStore";

export default function AvailableList() {
  const { available, isNominated } = useRoomStore(useShallow((s) => ({ available: s.available,  isNominated:s.isNominated })));
  if (!available.length) return <p className="text-sm text-gray-500">No games yet. Add one below.</p>;
  return (
    <div className="space-y-2">
      {available.map((g) => (
        <GameRow key={g.id} g={g} condition={isNominated} eventTrue={() => roomActions.unNominate(g.id)} eventFalse={() => roomActions.nominate(g.id)}  />
      ))}
    </div>
  );
}