"use client";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
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

type SortableInstance = ReturnType<typeof useSortable>;
type SortableListeners = SortableInstance["listeners"];
type SortableAttributes = SortableInstance["attributes"];

interface VotingListProps {
  games: Game[];
  onChange: (next: Game[]) => void;
  onSubmit: (finalOrder: Game[]) => void;
  canSubmit: boolean;
  isSubmitted: boolean;
}

export default function VotingList({ games, onChange, onSubmit, canSubmit, isSubmitted }: VotingListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const disableInteractions = !canSubmit || isSubmitted;

  const handleDragStart = (event: DragStartEvent) => {
    if (disableInteractions) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (disableInteractions) return;
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = games.findIndex((g) => g.id === active.id);
    const newIndex = games.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(games, oldIndex, newIndex));
  };

  const handleDragCancel = () => setActiveId(null);

  const submitDisabled = disableInteractions || !games.length;

  const handleSubmit = () => {
    if (submitDisabled) return;
    onSubmit(games);
  };

  const activeGame = useMemo(() => {
    if (!activeId) return null;
    return games.find((g) => g.id === activeId) ?? null;
  }, [games, activeId]);

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={games.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {games.map((g, index) => (
              <SortableVotingRow key={g.id} game={g} index={index} disabled={disableInteractions} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 120, easing: "cubic-bezier(0.3,0.7,0.4,1)" }}>
          {activeGame ? (
            <VotingRow
              game={activeGame}
              index={Math.max(games.findIndex((g) => g.id === activeGame.id), 0)}
              dragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            submitDisabled
              ? "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400"
              : "border border-black bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          {isSubmitted ? "Ranking submitted" : "Submit ranking"}
        </button>
        <p className="flex-1 text-right text-xs text-gray-500">
          {isSubmitted ? "Waiting for other players..." : "Submit when you're happy with the order."}
        </p>
      </div>
    </div>
  );
}

function SortableVotingRow({ game, index, disabled }: { game: Game; index: number; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: game.id, disabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : "transform 60ms ease-out",
    zIndex: isDragging ? 300 : undefined,
    position: isDragging ? "relative" : undefined,
    boxShadow: isDragging ? "0 18px 38px rgba(0,0,0,0.22)" : undefined,
    opacity: isDragging ? 0 : undefined,
  };

  return (
    <VotingRow
      game={game}
      index={index}
      style={style}
      setNodeRef={setNodeRef}
      listeners={disabled ? undefined : listeners}
      attributes={disabled ? undefined : attributes}
    />
  );
}

type VotingRowProps = {
  game: Game;
  index: number;
  style?: CSSProperties;
  setNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SortableListeners;
  attributes?: SortableAttributes;
  dragOverlay?: boolean;
  disabled?: boolean;
};

function VotingRow({
  game,
  index,
  style,
  setNodeRef,
  listeners,
  attributes,
  dragOverlay = false,
  disabled = false,
}: VotingRowProps) {
  const playersText = game.minPlayers || game.maxPlayers ? `${game.minPlayers ?? "?"}-${game.maxPlayers ?? "?"} players` : "";
  const timeText = game.time ? `${game.time} min` : "";
  const meta = [playersText, timeText].filter(Boolean).join(" | ");
  const listenerProps = !dragOverlay && listeners ? listeners : undefined;
  const attributeProps = !dragOverlay && attributes ? attributes : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        pointerEvents: dragOverlay ? "none" : undefined,
        cursor: dragOverlay ? "grabbing" : disabled ? "default" : "grab",
        touchAction: "none",
      }}
      className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition ${
        dragOverlay ? "shadow-xl" : ""
      }`}

      {...(listenerProps ?? {})}
      {...(attributeProps ?? {})}
    >
      <div className="w-6 text-xs font-semibold text-gray-500">{index + 1}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{game.title}</p>
        {meta && <p className="text-[11px] text-gray-500">{meta}</p>}
      </div>
    </div>
  );
}
