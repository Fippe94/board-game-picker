"use client";

import { useMemo } from "react";
import { useUserStore } from "@/app/store/userStore";
import { useRoomStore } from "@/app/store/roomStore";
import { roomActions } from "@/app/lib/roomActions";
import type { Player } from "@/app/lib/types";

function playerStatus(player: Player | undefined, isVoting: boolean, isResult: boolean) {
  if (!player) {
    return { label: "Not connected", className: "text-gray-400" };
  }

  if (isVoting) {
    return player.submitted
      ? { label: "Submitted", className: "text-green-600" }
      : { label: "Voting", className: "text-gray-500" };
  }

  if (isResult) {
    return player.submitted
      ? { label: "Submitted", className: "text-green-600" }
      : { label: "Pending", className: "text-gray-400" };
  }

  return player.ready
    ? { label: "Ready", className: "text-green-600" }
    : { label: "Not ready", className: "text-gray-400" };
}

export function AppHeader() {
  const nickname = useUserStore((s) => s.nickname);
  const phase = useRoomStore((s) => s.phase);
  const roomId = useRoomStore((s) => s.roomId);
  const nominated = useRoomStore((s) => s.nominated);
  const players = useRoomStore((s) => s.players);

  const playerArray = useMemo(() => Array.from(players.values()), [players]);
  const currentPlayer = nickname ? players.get(nickname) : undefined;
  const isVoting = phase === "voting";
  const isResult = phase === "result";
  const hasSubmitted = currentPlayer?.submitted ?? false;
  const submittedCount = playerArray.filter((p) => p.submitted).length;
  const totalPlayers = playerArray.length;
  const isReady = currentPlayer?.ready ?? false;
  const canToggleReady = (phase !== "voting" || !isReady) && Boolean(roomId);

  const otherPlayers = useMemo(() => {
    if (!currentPlayer) {
      return playerArray;
    }
    return playerArray.filter((p) => p.id !== currentPlayer.id);
  }, [playerArray, currentPlayer]);

  const myStatus = playerStatus(currentPlayer, isVoting, isResult);
  const phaseLabel = !roomId
    ? "-"
    : isResult
      ? "Result"
      : isVoting
        ? "Voting"
        : "Nomination";

  const handleToggleReady = () => {
    if (!nickname || !canToggleReady) return;
    roomActions.setReady(!isReady);
  };

  const showSubmissions = Boolean(roomId) && (isVoting || isResult);
  const showOtherPlayers = Boolean(roomId) && otherPlayers.length > 0;

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">BG</div>
          <div>
            <h1 className="text-lg font-semibold">Board Game Picker</h1>
            <p className="text-xs text-gray-500">Room: {roomId ?? "-"}</p>
            <p className="text-xs text-gray-500">You: {nickname || "-"}</p>
            <p className="text-xs text-gray-500">Phase: {phaseLabel}</p>
            {showSubmissions && (
              <p className="text-xs text-gray-500">
                Submissions: {submittedCount}/{totalPlayers}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium ${myStatus.className}`}>
            {myStatus.label}
          </span>
          {Boolean(roomId) && (
            <button
              onClick={handleToggleReady}
              disabled={!nickname || !canToggleReady}
              className={`rounded-xl px-3 py-1 text-sm font-medium border transition ${
                isReady ? "border-green-600 text-green-700 bg-green-50" : "border-black text-white bg-black"
              } ${(!nickname || !canToggleReady) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isReady ? (phase === "nomination" ? "Cancel ready" : "Ready") : "I'm ready"}
            </button>
          )}
        </div>
      </div>
      {showOtherPlayers && (
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <h3 className="text-xs font-semibold text-gray-500">Other players</h3>
          <ul className="mt-1 space-y-1">
            {otherPlayers.map((p) => {
              const status = playerStatus(p, isVoting, isResult);
              return (
                <li key={p.id} className="flex items-center justify-between text-xs text-gray-600">
                  <span>{p.nickName || p.id}</span>
                  <span className={status.className}>{status.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
