import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { io, type Socket } from "socket.io-client";
import "./App.css";
import type { LobbyState, PlayerSlot } from "./shared/protocol";
import { createGame } from "./game/engine";

type SocketStatus = "connecting" | "connected" | "disconnected";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [socketStatus, setSocketStatus] = useState<SocketStatus>("connecting");
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // INIT GAME
  useEffect(() => {
    if (!canvasRef.current) return;
    createGame(canvasRef.current);
  }, []);

  // LOAD LOBBY
  useEffect(() => {
    fetch("/api/lobby")
      .then((r) => r.json())
      .then(setLobby);
  }, []);

  // QR
  useEffect(() => {
    if (!lobby?.serverUrl) return;

    QRCode.toDataURL(lobby.serverUrl).then(setQrDataUrl);
  }, [lobby]);

  // SOCKET
  useEffect(() => {
    const socket: Socket = io();

    socket.on("connect", () => setSocketStatus("connected"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));

    socket.on("lobby:state", (state: LobbyState) => {
      setLobby(state);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>PicoPark Host</h1>

      <p>Estado: {socketStatus}</p>

      <p>IP: {lobby?.serverUrl}</p>

      {qrDataUrl && <img src={qrDataUrl} width={200} />}

      <h2>Juego</h2>

      <canvas ref={canvasRef} />

      <h2>Jugadores</h2>

      {lobby?.players.map((p) => (
        <div key={p.id}>
          {p.name} (slot {p.slot})
        </div>
      ))}
    </main>
  );
}

export default App;
