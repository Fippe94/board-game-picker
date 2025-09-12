"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUserStore } from "./store/userStore";

export default function EnterPage() {
  const [name, setName] = useState("");
  const setNickname = useUserStore((s) => s.setNickname);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNickname(name.trim());
    router.push("/room");
  }

  return (
    <form onSubmit={onSubmit} className="p-6">
      <h1 className="text-lg font-bold">Enter nickname</h1>
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded" />
      <button type="submit" className="ml-2 px-3 py-1 bg-black text-white rounded">
        Continue
      </button>
    </form>
  );
}