import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { io, type Socket } from "socket.io-client";
import "./App.css";
import type { ControllerInput, LobbyState } from "./shared/protocol";
import { createGame } from "./game/engine";

type PlayerInputEvent = {
  slot: number;
  input: ControllerInput;
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null);

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = createGame(canvasRef.current);
    gameRef.current = game;

    return () => {
      game.destroy();
      if (gameRef.current === game) {
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetch("/api/lobby")
      .then((r) => r.json())
      .then((data: LobbyState) => setLobby(data))
      .catch(() => setLobby(null));
  }, []);

  useEffect(() => {
    if (!lobby?.serverUrl) {
      setQrDataUrl("");
      return;
    }

    let active = true;

    QRCode.toDataURL(lobby.serverUrl)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });

    return () => {
      active = false;
    };
  }, [lobby?.serverUrl]);

  useEffect(() => {
    const socket: Socket = io();

    socket.on("lobby:state", (state: LobbyState) => {
      setLobby(state);
    });

    socket.on("player:input", (payload: PlayerInputEvent) => {
      gameRef.current?.setPlayerInput(payload.slot, payload.input);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top, #1e293b 0%, #020617 55%, #020617 100%)",
        color: "#e2e8f0",
      }}
    >
      <section
        style={{
          flex: "1 1 auto",
          display: "grid",
          placeItems: "center",
          padding: "20px 16px 12px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 980 }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              aspectRatio: "16 / 10",
              borderRadius: 24,
              background: "#0f172a",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.55)",
            }}
          />
        </div>
      </section>

      <section
        style={{
          flex: "0 0 auto",
          padding: "18px 16px 24px",
          borderTop: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(2, 6, 23, 0.72)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            display: "flex",
            gap: 20,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 240 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginBottom: 6,
              }}
            >
              IP / URL
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                wordBreak: "break-all",
                color: "#f8fafc",
              }}
            >
              {lobby?.serverUrl ?? "Conectando..."}
            </div>
          </div>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR para conectar"
              width={156}
              height={156}
              style={{
                borderRadius: 20,
                background: "#fff",
                padding: 10,
              }}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default App;
