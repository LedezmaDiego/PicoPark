const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const os = require("os");

app.use(express.static("public"));

const PUERTO = 3000;
let cantidadJugadores = 0;
const coloresParaJugadores = ["0xff4444", "0x44ff44", "0x4488ff", "0xffff44"];

function obtenerIPLocal() {
  const interfaces = os.networkInterfaces();
  let mejorIP = null;
  for (let nombre in interfaces) {
    for (let net of interfaces[nombre]) {
      if (net.family !== "IPv4" || net.internal) continue;
      const ip = net.address;
      if (
        nombre.toLowerCase().includes("virtual") ||
        nombre.toLowerCase().includes("vmware") ||
        nombre.toLowerCase().includes("hyper-v") ||
        nombre.toLowerCase().includes("wsl")
      ) {
        continue;
      }
      if (
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        (ip.startsWith("172.") &&
          parseInt(ip.split(".")[1]) >= 16 &&
          parseInt(ip.split(".")[1]) <= 31)
      ) {
        return ip;
      }
      if (!mejorIP) mejorIP = ip;
    }
  }
  return mejorIP || "localhost";
}

const ip = obtenerIPLocal();

app.get("/ip", (req, res) => {
  res.json({ ip });
});

io.on("connection", (socket) => {
  const esPantalla = socket.handshake.query.tipo === "pantalla";

  if (esPantalla) {
    console.log("🖥️  PANTALLA PRINCIPAL CONECTADA");
    // Emitir evento para resetear el estado del cliente (como presionar F5)
    console.log("📢 Notificando reinicio de servidor a todos los clientes");
    io.emit("servidorReiniciado");
  } else {
    if (cantidadJugadores >= 4) {
      console.log("❌ RECHAZADO: Sala llena");
      socket.disconnect(true);
      return;
    }

    const colorAsignado = coloresParaJugadores[cantidadJugadores];
    cantidadJugadores++;

    console.log(
      `📱 MANDO CONECTADO [ID: ${socket.id}]. Total Jugadores: ${cantidadJugadores}`,
    );

    io.emit("nuevoJugador", {
      idDelSocket: socket.id,
      color: colorAsignado,
    });
  }

  socket.on("message", (msg) => {
    io.emit("inputDeJugador", {
      idDelSocket: socket.id,
      tipoDeEvento: msg.tipo,
      teclaPresionada: msg.tecla,
    });
  });

  socket.on("error", (err) => {
    console.log(`⚠️ ERROR DE CONEXIÓN [ID: ${socket.id}]:`, err.message);
  });

  socket.on("disconnect", () => {
    if (esPantalla) {
      console.log("🖥️  PANTALLA PRINCIPAL DESCONECTADA");
    } else {
      cantidadJugadores--;
      console.log(
        `👋 MANDO DESCONECTADO [ID: ${socket.id}]. Total Jugadores: ${cantidadJugadores}`,
      );
      io.emit("jugadorDesconectado", socket.id);
    }
  });
});

http.listen(PUERTO, "0.0.0.0", () => {
  console.log(`🚀 SERVIDOR LISTO EN: http://${ip}:${PUERTO}`);
});
