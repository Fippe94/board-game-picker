"use client";
import { useEffect, useState } from "react";
import AvailableList from "../../components/AvailableList";
import NominatedList from "../../components/NominatedList";
import AddGameForm from "../../components/AddGameForm";
import MyCollectionPicker from "../../components/MyCollectionPicker";
import VotingList from "../../components/VotingList";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { useRoom } from "../../lib/useRoom";
import { useParams } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";
import { useRoomStore } from "@/app/store/roomStore";
import { Player, Game } from "@/app/lib/types";
import { roomActions } from "@/app/lib/roomActions";
import { useSessionStore } from "@/app/store/sessionStore";
import { getRealtimeUrl } from "@/app/lib/realtimeConfig";

const RT_URL = getRealtimeUrl();

export default function Home() {
  const { id } = useParams<{ id: string }>();
  const nickname = useUserStore((s) => s.nickname);
  useRoom(RT_URL, id, nickname);
  const addToMyCollection = useSessionStore((s) => s.addToMyCollection);
  const players = useRoomStore((s) => s.players);
  const phase = useRoomStore((s) => s.phase);
  const nominated = useRoomStore((s) => s.nominated);
  const result = useRoomStore((s) => s.result);

  const playerArray: Player[] = Array.from(players.values());
  const currentPlayer = nickname ? players.get(nickname) : undefined;
  const isVoting = phase === "voting";
  const isResult = phase === "result";
  const hasSubmitted = currentPlayer?.submitted ?? false;
  const submittedCount = playerArray.filter((p) => p.submitted).length;

  const [votingOrder, setVotingOrder] = useState<Game[]>([]);
  const handleSubmitVote = () => {
    if (!votingOrder.length || hasSubmitted) return;
    roomActions.submitVote(votingOrder.map((g) => g.id));
  };

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
      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          {isVoting ? (
            <VotingList
              games={votingOrder}
              onChange={setVotingOrder}
              onSubmit={handleSubmitVote}
              canSubmit={isVoting && Boolean(nickname)}
              isSubmitted={hasSubmitted}
            />
          ) : isResult ? (
            <div className="space-y-4">
              <div className="rounded-2xl border bg-white p-4 space-y-2">
                <h2 className="text-base font-semibold">Result</h2>
                <p className="text-sm text-gray-600">
                  {result?.title}
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4 space-y-2">
                <h3 className="text-sm font-semibold">Nominated games</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {nominated.length ? (
                    nominated.map((game, index) => (
                      <li key={game.id} className="flex items-start justify-between gap-3">
                        <span className="text-gray-500">{index + 1}.</span>
                        <span className="flex-1 font-medium text-gray-900">{game.title}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No games nominated.</li>
                  )}
                </ul>
              </div>
            </div>
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
