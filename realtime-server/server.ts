import http from 'http';
import { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';

type Game = { id: string; title: string; minPlayers?: number; maxPlayers?: number; time?: number; nominator?: string };
type RoomPhase = 'nomination' | 'voting';
type Player = { id: string; nickName?: string; ready: boolean };
type RoomState = { available: Game[]; nominated: Game[]; players: Map<string, Player>; phase: RoomPhase };
type SendableRoomState = { available: Game[]; nominated: Game[]; players: Player[]; phase: RoomPhase };

// In-memory rooms. Replace with DB later.
const rooms = new Map<string, RoomState>();

function uid(n = 8) { return randomBytes(n).toString('hex'); }

function createPlayer(playerName: string): Player {
  const id = playerName || uid(6);
  return { id, nickName: playerName || id, ready: false };
}

function ensureRoom(id: string): RoomState {
  if (!rooms.has(id)) {
    rooms.set(id, { available: [], nominated: [], players: new Map<string, Player>(), phase: 'nomination' });
  }
  return rooms.get(id)!;
}

function resetToNomination(room: RoomState) {
  room.phase = 'nomination';
  room.players.forEach((p) => {
    p.ready = false;
  });
}

function allPlayersReady(room: RoomState) {
  if (room.players.size === 0) return false;
  for (const player of room.players.values()) {
    if (!player.ready) return false;
  }
  return true;
}

function markPlayerNotReady(room: RoomState, actingPlayer: Player | null) {
  if (!actingPlayer) return;
  const current = room.players.get(actingPlayer.id);
  if (!current) return;
  current.ready = false;
  room.phase = 'nomination';
}

function mapToArray(map: Map<string, Player>) {
  const array: Player[] = [];
  for (const value of map.values()) {
    array.push(value);
  }
  return array;
}

function convertRoomState(roomState: RoomState): SendableRoomState {
  return {
    available: roomState.available,
    nominated: roomState.nominated,
    players: mapToArray(roomState.players),
    phase: roomState.phase,
  };
}

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
});

io.on('connection', (socket: Socket) => {
  let roomId: string | null = null;
  let player: Player | null = null;

  socket.on('room:join', (id: string, playerName: string) => {
    roomId = id;
    socket.join(id);
    player = createPlayer(playerName);

    const room = ensureRoom(id);
    resetToNomination(room);
    room.players.set(player.id, player);
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('room:create', (playerName: string) => {
    const id = uid(3); // 6 hex chars
    roomId = id;
    player = createPlayer(playerName);

    const room: RoomState = { available: [], nominated: [], players: new Map<string, Player>(), phase: 'nomination' };
    room.players.set(player.id, player);
    rooms.set(id, room);

    socket.join(id);
    socket.emit('room:created', id);
    socket.emit('room:snapshot', convertRoomState(room));
  });

  // Mutations
  socket.on('game:addAvailable', (g: Game) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'nomination') return;
    markPlayerNotReady(room, player);
    const withId = { ...g, id: g.id || uid(4) };
    room.available.push(withId);
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('game:nominate', (id: string) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'nomination') return;
    const idx = room.available.findIndex(x => x.id === id);
    if (idx === -1) return;
    const g = room.available[idx];
    g.nominator = player?.nickName;
    markPlayerNotReady(room, player);
    room.nominated.push(g);
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('game:unnominate', (id: string) => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.phase !== 'nomination') return;
    const idx = room.nominated.findIndex(x => x.id === id);
    if (idx === -1) return;
    const g = room.nominated[idx];
    if (g.nominator !== player?.nickName) {
      return;
    }
    markPlayerNotReady(room, player);
    room.nominated.splice(idx, 1);
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('player:setReady', (ready: boolean) => {
    if (!roomId || !player) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const current = room.players.get(player.id);
    if (!current) return;
    current.ready = ready;
    room.phase = allPlayersReady(room) ? 'voting' : 'nomination';
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('room:reset', () => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    room.available = [];
    room.nominated = [];
    resetToNomination(room);
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });

  socket.on('disconnect', () => {
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    if (player) {
      room.players.delete(player.id);
    }
    if (room.players.size === 0) {
      rooms.delete(roomId);
      return;
    }
    room.phase = allPlayersReady(room) ? 'voting' : 'nomination';
    io.to(roomId).emit('room:snapshot', convertRoomState(room));
  });
});

const PORT = process.env.RT_PORT ? Number(process.env.RT_PORT) : 3030;
server.listen(PORT, () => console.log(`[realtime] listening on :${PORT}`));
