import http from 'http';
import { Server, Socket } from 'socket.io';
import { randomBytes } from 'crypto';

type Game = { id: string; title: string; minPlayers?: number; maxPlayers?: number; time?: number; nominator?: string };
type RoomState = { available: Game[]; nominated: Game[], players: Map<string,Player> };
type SendableRoomState = { available: Game[]; nominated: Game[], players: Player[] };
type Player = { id: string, nickName? : string}

// In-memory rooms. Replace with DB later.
const rooms = new Map<string, RoomState>();

function uid(n = 8) { return randomBytes(n).toString('hex'); }

function mapToArray(map: Map<string,Player>){
  const array = [];
  for (const [key, value] of map.entries()) {
  array.push(value);
} 
return array;
}

function convertRoomState(roomState: RoomState){
  var sendable: SendableRoomState = { available: roomState.available, nominated: roomState.nominated, players: mapToArray(roomState.players)};
  return sendable;
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
    player = {id: playerName, nickName: playerName};

    if (!rooms.has(id)) rooms.set(id, { available: [], nominated: [], players: new Map<string, Player>() });
    var room = rooms.get(id)!;
    room.players.set(player.id, player);
    console.log('players: ' + room.players.size)
    // send snapshot to the clients
    io.to(roomId).emit('room:snapshot', convertRoomState(rooms.get(id)!));
  });

  socket.on('room:create', (playerName: string) => {
    const id = uid(3); // 6 hex chars
    player = {id: playerName, nickName: playerName};

    rooms.set(id, { available: [], nominated: [], players: new Map<string, Player>() });
    var room = rooms.get(id)!;
    room.players.set(player.id, player);
    socket.join(id);
    roomId = id;
    socket.emit('room:created', id);
    socket.emit('room:snapshot', convertRoomState(rooms.get(id)!));
  });

  // Mutations
  socket.on('game:addAvailable', (g: Game) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const withId = { ...g, id: g.id || uid(4) };
    s.available.push(withId);
    io.to(roomId).emit('room:snapshot', convertRoomState(s));
  });

  socket.on('game:nominate', (id: string) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const idx = s.available.findIndex(x => x.id === id);
    if (idx === -1) return;
    let g = s.available[idx];
    g.nominator = player?.nickName;
    s.nominated.push(g);
    io.to(roomId).emit('room:snapshot', convertRoomState(s));
  });

  socket.on('game:unnominate', (id: string) => {
    if (!roomId) return;
    const s = rooms.get(roomId)!;
    const idx = s.nominated.findIndex(x => x.id === id);
    if (idx === -1) return;
    let g = s.nominated[idx];
    // We only let the nominator remove the game
    if (g.nominator != player?.nickName){
      return;
    }
    s.nominated.splice(idx, 1);
    io.to(roomId).emit('room:snapshot', convertRoomState(s));
  });

  socket.on('room:reset', () => {
    if (!roomId) return;
    const players = rooms.get(roomId)?.players ?? new Map<string,Player>;
    rooms.set(roomId, { available: [], nominated: [], players: players });
    io.to(roomId).emit('room:snapshot', convertRoomState(rooms.get(roomId)!));
  });

  socket.on('disconnect', () => {
    if (!roomId) return;
    const room = rooms.get(roomId)!;
    if (player){
      room.players.delete(player?.id);
      io.to(roomId).emit('room:snapshot', convertRoomState(room));
    }
    if (room.players.size == 0){
      rooms.delete(roomId);
    }    
  });
});

const PORT = process.env.RT_PORT ? Number(process.env.RT_PORT) : 3030;
server.listen(PORT, () => console.log(`[realtime] listening on :${PORT}`));