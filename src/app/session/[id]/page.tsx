"use client";
import { useEffect, useState } from "react";
import AvailableList from "../../components/AvailableList";
import NominatedList from "../../components/NominatedList";
import AddGameForm from "../../components/AddGameForm";
import MyCollectionPicker from "../../components/MyCollectionPicker";
import VotingList from "../../components/VotingList";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useRoom } from "../../lib/useRoom";
import { useParams } from "next/navigation";
import { useUserStore } from '@/app/store/userStore';
import { useRoomStore } from '@/app/store/roomStore';
import { Player, Game } from '@/app/lib/types';
import { roomActions } from "@/app/lib/roomActions";
import { useSessionStore } from "@/app/store/sessionStore";
const RT_URL = process.env.NEXT_PUBLIC_RT_URL || "http://161.35.43.235:3030";

export default function Home() {
  const { id } = useParams<{ id: string }>();
  const nickname = useUserStore((s) => s.nickname);
  useRoom(RT_URL, id, nickname); // initializes socket & store ONCE
  const addToMyCollection = useSessionStore((s) => s.addToMyCollection);
  const players = useRoomStore((s) => s.players);
  const roomId = useRoomStore((s) => s.roomId);
  const phase = useRoomStore((s) => s.phase);
  const nominated = useRoomStore((s) => s.nominated);

  const playerArray: Player[] = Array.from(players.values());
  const currentPlayer = nickname ? players.get(nickname) : undefined;
  const isReady = currentPlayer?.ready ?? false;
  const isVoting = phase === "voting";
  const canToggleReady = !isVoting || !isReady;
  const toggleReady = () => {
    if (!canToggleReady) return;
    roomActions.setReady(!isReady);
  };

  const otherPlayers = currentPlayer
    ? playerArray.filter((p) => p.id !== currentPlayer.id)
    : playerArray;
  const [votingOrder, setVotingOrder] = useState<Game[]>([]);

  useEffect(() => {
    if (!isVoting) {
      if (votingOrder.length) {
        setVotingOrder([]);
      }
      return;
    }

    setVotingOrder((prev) => {
      if (!nominated.length) return [];
      if (!prev.length) return [...nominated];
      const nominatedMap = new Map(nominated.map((g) => [g.id, g]));
      const preserved = prev
        .filter((g) => nominatedMap.has(g.id))
        .map((g) => nominatedMap.get(g.id)!);
      nominated.forEach((g) => {
        if (!preserved.some((p) => p.id === g.id)) {
          preserved.push(g);
        }
      });
      return preserved;
    });
  }, [isVoting, nominated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">BG</div>
            <div>
              <h1 className="text-lg font-semibold">Board Game Picker</h1>
              <p className="text-xs text-gray-500">Room: {roomId}</p>
              <p className="text-xs text-gray-500">You: {nickname}</p>
              <p className="text-xs text-gray-500">Phase: {isVoting ? "Voting" : "Nomination"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${isReady ? "text-green-600" : "text-gray-500"}`}>
              {isReady ? "Ready" : "Not ready"}
            </span>
            <button
              onClick={toggleReady}
              disabled={!nickname || !canToggleReady}
              className={`rounded-xl px-3 py-1 text-sm font-medium border transition ${
                isReady ? "border-green-600 text-green-700 bg-green-50" : "border-black text-white bg-black"
              } ${(!nickname || !canToggleReady) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isReady ? (isVoting ? "Ready" : "Cancel ready") : "I'm ready"}
            </button>
          </div>
        </div>
        {otherPlayers.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <h3 className="text-xs font-semibold text-gray-500">Other players</h3>
            <ul className="mt-1 space-y-1">
              {otherPlayers.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-xs text-gray-600">
                  <span>{p.nickName || p.id}</span>
                  <span className={p.ready ? "text-green-600" : "text-gray-400"}>{p.ready ? "Ready" : "Not ready"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          {isVoting ? (
            <VotingList games={votingOrder} onChange={setVotingOrder} />
          ) : (
            <Tabs>
              <TabList>
                <Tab>Collection</Tab>
                <Tab>Available</Tab>
                <Tab>Nominated</Tab>
              </TabList>
              <TabPanel>
                <h2 className="text-base font-semibold mb-2">Collection</h2>
                <MyCollectionPicker />

                <div className="mt-6 rounded-2xl border bg-white p-3 space-y-3">
                  <h3 className="text-sm font-semibold">Add game (manual)</h3>
                  <AddGameForm submitMethod={addToMyCollection} buttonText="Add to Collection" />
                </div>
              </TabPanel>

              <TabPanel>
                <h2 className="text-base font-semibold mb-2">Available</h2>
                <AvailableList />

                <div className="mt-6 rounded-2xl border bg-white p-3 space-y-3">
                  <h3 className="text-sm font-semibold">Add game (manual)</h3>
                  <AddGameForm submitMethod={roomActions.addAvailable} buttonText="Add to Available" />
                </div>
              </TabPanel>

              <TabPanel>
                <h2 className="text-base font-semibold mb-2">Nominated</h2>
                <NominatedList />
              </TabPanel>
            </Tabs>
          )}
        </section>
      </main>
    </div>
  );
}


