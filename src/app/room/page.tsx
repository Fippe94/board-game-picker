"use client";
import { useRouter } from "next/navigation";
import { randomBytes } from "crypto";

function uid(n = 8) { return randomBytes(n).toString('hex'); }

export default function Home() {
  const router = useRouter();
  //useRoom(RT_URL);
  const create = () => {
    router.push(`/session/${uid(2)}`);
  };

  const join = (id: string) => {
    //roomActions.joinRoom(id);
    router.push(`/session/${id}`);
  };

  return (
    <div className="p-6 space-y-4">
      <button onClick={create} className="px-4 py-2 bg-black text-white rounded">
        Create Room
      </button>

      <form onSubmit={(e) => {
        e.preventDefault();
        const id = new FormData(e.currentTarget).get("code") as string;
        join(id);
      }} className="flex gap-2">
        <input name="code" placeholder="Enter room code" className="border p-2 rounded" />
        <button type="submit" className="px-3 py-1 border rounded">Join</button>
      </form>
    </div>
  );
}