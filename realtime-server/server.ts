import http from 'http';
import { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';

type Game = { id: string; title: string; minPlayers?: number; maxPlayers?: number; time?: number; nominator?: string };
type RoomState = { available: Game[]; nominated: Game[] };
type Player = { nickName? : string}

// In-memory rooms. Replace with DB later.
const rooms = new Map<string, RoomState>();

function uid(n = 8) { return randomBytes(n).toString('hex'); }

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
});

io.on('connection', (socket: Socket) => {
  let roomId: string | null = null;

  socket.on('room:join', (id: string) => {
    roomId = id;
    socket.join(id);
    if (!rooms.has(id)) rooms.set(id, { available: [], nominated: [] });
    // send snapshot to the new client
    socket.emit('room:snapshot', rooms.get(id));
  });

  socket.on('room:create', () => {
    const id = uid(3); // 6 hex chars
    rooms.set(id, { available: [], nominated: [] });
    socket.join(id);
    roomId = id;
    socket.emit('room:created', id);
    socket.emit('room:snapshot', rooms.get(id));
  });

  // Mutations
  socket.on('game:addAvailable', (g: Game) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const withId = { ...g, id: g.id || uid(4) };
    s.available.push(withId);
    io.to(roomId).emit('room:snapshot', s);
  });

  socket.on('game:nominate', (id: string, nominator: string) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const idx = s.available.findIndex(x => x.id === id);
    if (idx === -1) return;
    let g = s.available[idx];
    g.nominator = nominator;
    s.nominated.push(g);
    io.to(roomId).emit('room:snapshot', s);
  });

  socket.on('game:unnominate', (id: string, user : string) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const idx = s.nominated.findIndex(x => x.id === id);
    if (idx === -1) return;
    let g = s.nominated[idx];
    // We only let the nominator remove the game
    if (g.nominator != user){
      return;
    }
    s.nominated.splice(idx, 1);
    io.to(roomId).emit('room:snapshot', s);
  });

  socket.on('room:reset', () => {
    if (!roomId) return;
    rooms.set(roomId, { available: [], nominated: [] });
    io.to(roomId).emit('room:snapshot', rooms.get(roomId));
  });

  socket.on('disconnect', () => {
    // optional: prune empty rooms later
  });
});

const PORT = process.env.RT_PORT ? Number(process.env.RT_PORT) : 3030;
server.listen(PORT, () => console.log(`[realtime] listening on :${PORT}`));