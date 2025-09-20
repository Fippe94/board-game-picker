"use client";
import type { MouseEvent } from "react";
import type { Game } from "../lib/types";

type GameRowProps = {
  g: Game;
  condition?: (id: string) => boolean;
  eventTrue?: (id: string) => void;
  eventFalse?: (id: string) => void;
  disabled?: boolean;
  onEdit?: (game: Game) => void;
  onRemove?: (game: Game) => void;
};

export function GameRow({
  g,
  condition = () => false,
  eventTrue = () => undefined,
  eventFalse = () => undefined,
  disabled = false,
  onEdit,
  onRemove,
}: GameRowProps) {
  const isActive = condition(g.id);
  const showActions = Boolean(onEdit || onRemove);

  const handleClick = () => {
    if (disabled) return;
    if (isActive) {
      eventTrue(g.id);
    } else {
      eventFalse(g.id);
    }
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(g);
    }
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onRemove) {
      onRemove(g);
    }
  };

  const playersText =
    g.minPlayers || g.maxPlayers ? `${g.minPlayers ?? "?"}-${g.maxPlayers ?? "?"} players` : "";
  const timeText = g.time ? `${g.time} min` : "";
  const nominatorText = isActive && g.nominator ? `nominated by ${g.nominator}` : "";

  const metaParts = [playersText, timeText, nominatorText].filter(Boolean);

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-2 ${
        isActive ? "border-green-500 bg-green-100" : "border-gray-200 bg-white"
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer hover:bg-gray-50"}`}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{g.title}</p>
        {metaParts.length > 0 && (
          <p className="text-[11px] text-gray-500">{metaParts.join(" | ")}</p>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg border px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}

