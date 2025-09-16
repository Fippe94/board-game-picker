"use client";
import type { CSSProperties } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Game } from "../lib/types";

interface VotingListProps {
  games: Game[];
  onChange: (next: Game[]) => void;
}

export default function VotingList({ games, onChange }: VotingListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = games.findIndex((g) => g.id === active.id);
    const newIndex = games.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(games, oldIndex, newIndex));
  };

  if (!games.length) {
    return <p className="text-sm text-gray-500">No nominated games are ready for voting yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Rank the nominated games</h2>
        <p className="text-sm text-gray-500">
          Drag each card (or use arrow keys) to order games from most to least preferred. This order is only visible to you.
        </p>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={games.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {games.map((g, index) => (
              <SortableVotingRow key={g.id} game={g} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableVotingRow({ game, index }: { game: Game; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: game.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? "0 10px 30px rgba(0,0,0,0.15)" : undefined,
  } as CSSProperties;

  const playersText = game.minPlayers || game.maxPlayers ? `${game.minPlayers ?? "?"}-${game.maxPlayers ?? "?"} players` : "";
  const timeText = game.time ? `${game.time} min` : "";
  const meta = [playersText, timeText].filter(Boolean).join(" | ");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition ${
        isDragging ? "opacity-90" : ""
      }`}
    >
      <div className="w-6 text-xs font-semibold text-gray-500">{index + 1}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{game.title}</p>
        {meta && <p className="text-[11px] text-gray-500">{meta}</p>}
      </div>
      <button
        type="button"
        className="rounded border border-gray-300 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
        aria-label={`Drag handle for ${game.title}`}
        style={{ touchAction: "none" }}
        {...listeners}
        {...attributes}
      >
        |||
      </button>
    </div>
  );
}










