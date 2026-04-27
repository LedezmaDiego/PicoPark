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

function logPlayers() {
  const count = players.size;

  if (count === 0) {
    console.log("No hay jugadores conectados");
  } else if (count === 1) {
    console.log("1 jugador conectado");
  } else {
    console.log(`${count} jugadores conectados`);
  }
}

function getLocalIp(): string {
  const nets = networkInterfaces();

  for (const interfaces of Object.values(nets)) {
    if (!interfaces) continue;

    for (const net of interfaces) {
      if (net.family !== "IPv4") continue;
      if (net.internal) continue;

      const ip = net.address;

      if (
        ip.startsWith("192.168.56.") ||
        ip.startsWith("169.254.") ||
        ip.startsWith("127.")
      )
        continue;

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
  for (let slot = 0; slot < MAX_PLAYERS; slot++) {
    const occupied = [...players.values()].some((p) => p.slot === slot);
    if (!occupied) return slot;
  }
  return null;
}

function buildLobbyState(): LobbyState {
  return {
    maxPlayers: MAX_PLAYERS,
    connectedPlayers: players.size,
    players: [...players.values()].sort((a, b) => a.slot - b.slot),
    serverUrl: getServerUrl(),
    updatedAt: Date.now(),
  };
}

function normalizeName(name: string | undefined, slot: number) {
  const trimmed = name?.trim();
  return trimmed ? trimmed.slice(0, 20) : `Jugador ${slot + 1}`;
}

const httpServer = createServer((req, res) => {
  const url = new URL(
    req.url ?? "/",
    `http://${req.headers.host ?? "localhost"}`,
  );

  if (req.method === "GET" && url.pathname === "/api/lobby") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(buildLobbyState()));
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: true },
});

function broadcastLobby() {
  io.emit("lobby:state", buildLobbyState());
}

io.on("connection", (socket) => {
  socket.emit("lobby:state", buildLobbyState());

  socket.on(
    "controller:join",
    (payload: ControllerJoinPayload, ack?: (r: ControllerJoinAck) => void) => {
      if (players.size >= MAX_PLAYERS) {
        console.log("Intento de conexión rechazado: lobby lleno");
        ack?.({ ok: false, reason: "lobby_full" });
        return;
      }

      const slot = nextSlot();
      if (slot === null) {
        console.log("Error: no hay slots disponibles");
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

      console.log(`Jugador conectado: ${player.name}`);
      logPlayers();

      ack?.({ ok: true, player, lobby: buildLobbyState() });

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
    });
  });

  socket.on("disconnect", () => {
    const player = players.get(socket.id);
    if (!player) return;

    players.delete(socket.id);

    console.log(`Jugador desconectado: ${player.name}`);
    logPlayers();

    broadcastLobby();
  });
});

httpServer.listen(PORT, HTTP_HOST, () => {
  console.log(`Servidor iniciado en ${getServerUrl()}`);
});
