"use client";
import type { Game } from "../lib/types";

export function GameRow({
  g,
  condition = () => false,
  eventTrue = () => undefined,
  eventFalse = () => undefined,
  disabled = false,
}: {
  g: Game;
  condition?: (id: string) => boolean;
  eventTrue?: (id: string) => void;
  eventFalse?: (id: string) => void;
  disabled?: boolean;
}) {
  const isActive = condition(g.id);
  const handleClick = () => {
    if (disabled) return;
    if (isActive) {
      eventTrue(g.id);
    } else {
      eventFalse(g.id);
    }
  };

  const playersText = g.minPlayers || g.maxPlayers ? `${g.minPlayers ?? "?"}-${g.maxPlayers ?? "?"} players` : "";
  const timeText = g.time ? `${g.time} min` : "";
  const nominatorText = isActive && g.nominator ? `nominated by ${g.nominator}` : "";

  const metaParts = [playersText, timeText, nominatorText].filter(Boolean);

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-2 ${
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
    </div>
  );
}
