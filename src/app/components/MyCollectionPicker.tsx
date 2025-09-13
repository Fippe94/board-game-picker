"use client";
import { useSessionStore } from "../store/sessionStore";
import { roomActions } from "../lib/roomActions";
import { GameRow } from "./GameRow";
import { useRoomStore } from "../store/roomStore";

export default function MyCollectionPicker() {
  const myCollection= useSessionStore().myCollection;
    const isAvailable = useRoomStore().isAvailable;
  if (!myCollection.length) return <p className="text-sm text-gray-500">No games in your collection yet.</p>;
  return (
    <div className="space-y-2">
      {myCollection.map((g) => (
            <GameRow key={g.id} g={g} condition={isAvailable} eventFalse={() => roomActions.addAvailable(g)} />
          )
      )}
    </div>
  );
}