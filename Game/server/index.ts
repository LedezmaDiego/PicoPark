import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { Server } from "socket.io";
import {
  MAX_PLAYERS,
  PLAYER_COLORS,
  type ControllerInput,
  type ControllerJoinAck,
  type ControllerJoinPayload,
  type LobbyState,
  type PlayerSlot,
} from "../src/shared/protocol";

const PORT = Number(Bun.env.PORT ?? 3001);
const HTTP_HOST = "0.0.0.0";

const players = new Map<string, PlayerSlot>();

function getLocalIp(): string {
  const nets = networkInterfaces();

  for (const interfaces of Object.values(nets)) {
    if (!interfaces) continue;

    for (const net of interfaces) {
      if (net.family !== "IPv4") continue;
      if (net.internal) continue;

      const ip = net.address;

      // ❌ descartar redes virtuales comunes
      if (
        ip.startsWith("192.168.56.") || // VirtualBox
        ip.startsWith("169.254.") || // APIPA
        ip.startsWith("127.") // loopback
      ) {
        continue;
      }

      // ✔️ priorizar redes típicas de LAN
      if (
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        (ip.startsWith("172.") &&
          (() => {
            const second = Number(ip.split(".")[1]);
            return second >= 16 && second <= 31;
          })())
      ) {
        return ip;
      }
    }
  }

  return "127.0.0.1";
}

function getServerUrl(): string {
  return `http://${getLocalIp()}:${PORT}`;
}

function nextSlot(): number | null {
  for (let slot = 0; slot < MAX_PLAYERS; slot += 1) {
    const occupied = [...players.values()].some(
      (player) => player.slot === slot,
    );
    if (!occupied) return slot;
  }
  return null;
}

function buildLobbyState(): LobbyState {
  const orderedPlayers = [...players.values()].sort((a, b) => a.slot - b.slot);

  return {
    maxPlayers: MAX_PLAYERS,
    connectedPlayers: orderedPlayers.length,
    players: orderedPlayers,
    serverUrl: getServerUrl(),
    updatedAt: Date.now(),
  };
}

function normalizeName(name: string | undefined, slot: number): string {
  const trimmed = name?.trim();
  if (trimmed && trimmed.length > 0) return trimmed.slice(0, 20);
  return `Player ${slot + 1}`;
}

const httpServer = createServer((req, res) => {
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );

  if (req.method === "GET" && url.pathname === "/api/lobby") {
    const lobby = buildLobbyState();

    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(lobby));
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

function broadcastLobby() {
  io.emit("lobby:state", buildLobbyState());
}

io.on("connection", (socket) => {
  socket.emit("lobby:state", buildLobbyState());

  socket.on(
    "controller:join",
    (
      payload: ControllerJoinPayload,
      ack?: (response: ControllerJoinAck) => void,
    ) => {
      if (players.has(socket.id)) {
        ack?.({ ok: false, reason: "already_joined" });
        return;
      }

      if (players.size >= MAX_PLAYERS) {
        ack?.({ ok: false, reason: "lobby_full" });
        return;
      }

      const slot = nextSlot();
      if (slot === null) {
        ack?.({ ok: false, reason: "lobby_full" });
        return;
      }

      const player: PlayerSlot = {
        id: socket.id,
        name: normalizeName(payload.displayName, slot),
        color: PLAYER_COLORS[slot],
        slot,
        connectedAt: Date.now(),
      };

      players.set(socket.id, player);
      socket.data.playerId = socket.id;

      const lobby = buildLobbyState();
      ack?.({ ok: true, player, lobby });
      io.emit("player:joined", player);
      broadcastLobby();
    },
  );

  socket.on("controller:input", (input: ControllerInput) => {
    const player = players.get(socket.id);
    if (!player) return;

    io.emit("player:input", {
      playerId: player.id,
      slot: player.slot,
      input,
      at: Date.now(),
    });
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (!player) return;

    players.delete(socket.id);
    io.emit("player:left", {
      id: player.id,
      slot: player.slot,
    });
    broadcastLobby();
  });
});

httpServer.listen(PORT, HTTP_HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Host server running at ${getServerUrl()}`);
});
