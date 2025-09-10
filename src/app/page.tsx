"use client";
import { useEffect, useMemo, useState } from 'react';
import AvailableList from "./components/AvailableList";
import NominatedList from "./components/NominatedList";
import AddGameForm from "./components/AddGameForm";
import MyCollectionPicker from "./components/MyCollectionPicker";
import { useSessionStore } from "./store/sessionStore";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useRoom } from "./lib/useRoom";
const RT_URL = process.env.NEXT_PUBLIC_RT_URL || "http://161.35.43.235:3030";

export default function Home() {

  const qs = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const startRoom = qs?.get("room") || undefined;
  useRoom(RT_URL, startRoom); // initializes socket & store ONCE
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center font-bold">BG</div>
            <div>
              <h1 className="text-lg font-semibold">Board Night</h1>
              <p className="text-xs text-gray-500">Two‑list MVP</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        <section>
          <Tabs>
            <TabList>
              <Tab>Available</Tab>
              <Tab>Nominated</Tab>
            </TabList>
            <TabPanel>
              <h2 className="text-base font-semibold mb-2">Available</h2>
              <AvailableList />
              
          <div className="mt-6 rounded-2xl border bg-white p-3 space-y-3">
            <h3 className="text-sm font-semibold">Add game (manual)</h3>
            <AddGameForm />
          </div>

          <div className="mt-3 rounded-2xl border bg-white p-3 space-y-3">
            <h3 className="text-sm font-semibold">Add from My Collection (mock)</h3>
            <MyCollectionPicker />
          </div>
            </TabPanel>
            <TabPanel>
              <h2 className="text-base font-semibold mb-2">Nominated</h2>
              <NominatedList />
            </TabPanel>
          </Tabs>

        </section>
      </main>
    </div>
  );
}