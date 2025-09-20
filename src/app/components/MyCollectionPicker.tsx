"use client";
import { useState, type FormEvent } from "react";
import { useSessionStore } from "../store/sessionStore";
import { roomActions } from "../lib/roomActions";
import { GameRow } from "./GameRow";
import { useRoomStore } from "../store/roomStore";
import type { Game } from "../lib/types";

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function EditCollectionForm({
  game,
  onCancel,
  onSave,
}: {
  game: Game;
  onCancel: () => void;
  onSave: (updated: Game) => void;
}) {
  const [title, setTitle] = useState(game.title);
  const [time, setTime] = useState(game.time ? String(game.time) : "");
  const [minPlayers, setMinPlayers] = useState(
    game.minPlayers !== undefined ? String(game.minPlayers) : ""
  );
  const [maxPlayers, setMaxPlayers] = useState(
    game.maxPlayers !== undefined ? String(game.maxPlayers) : ""
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSave({
      ...game,
      id: trimmedTitle,
      title: trimmedTitle,
      time: parseNumber(time),
      minPlayers: parseNumber(minPlayers),
      maxPlayers: parseNumber(maxPlayers),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-gray-200 bg-white p-3"
    >
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-xs font-medium text-gray-500">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Game title"
          />
        </label>
        <label className="text-xs font-medium text-gray-500">
          Duration (min)
          <input
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 45"
          />
        </label>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-xs font-medium text-gray-500">
          Min players
          <input
            value={minPlayers}
            onChange={(event) => setMinPlayers(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 2"
          />
        </label>
        <label className="text-xs font-medium text-gray-500">
          Max players
          <input
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(event.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="e.g. 5"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default function MyCollectionPicker() {
  const myCollection = useSessionStore((state) => state.myCollection);
  const updateGame = useSessionStore((state) => state.updateMyCollection);
  const removeGame = useSessionStore((state) => state.removeFromMyCollection);
  const isAvailable = useRoomStore((state) => state.isAvailable);
  const phase = useRoomStore((state) => state.phase);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!myCollection.length) {
    return <p className="text-sm text-gray-500">No games in your collection yet.</p>;
  }

  const actionsDisabled = phase !== "nomination";

  const handleAddToAvailable = (game: Game) => {
    if (actionsDisabled) return;
    roomActions.addAvailable(game);
  };

  const handleRemove = (id: string) => {
    const confirmed = window.confirm("Remove this game from your collection?");
    if (!confirmed) return;
    removeGame(id);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {myCollection.map((game) => {
        if (editingId === game.id) {
          return (
            <EditCollectionForm
              key={game.id}
              game={game}
              onCancel={() => setEditingId(null)}
              onSave={(updated) => {
                updateGame(game.id, updated);
                setEditingId(null);
              }}
            />
          );
        }

        return (
          <GameRow
            key={game.id}
            g={game}
            condition={isAvailable}
            eventFalse={() => handleAddToAvailable(game)}
            disabled={actionsDisabled}
            onEdit={() => setEditingId(game.id)}
            onRemove={() => handleRemove(game.id)}
          />
        );
      })}
      {actionsDisabled && (
        <p className="text-[11px] text-gray-500">Voting in progress. Additions are paused.</p>
      )}
    </div>
  );
}

