const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const os = require("os");

app.use(express.static("public"));

const PUERTO = 3000;
const gamepadsConectados = new Set();
const coloresParaJugadores = ["0xff4444", "0x44ff44", "0x4488ff", "0xffff44"];

function obtenerIPLocal() {
  const interfaces = os.networkInterfaces();
  let mejorIP = null;

  for (let nombre in interfaces) {
    if (
      nombre.toLowerCase().includes("virtual") ||
      nombre.toLowerCase().includes("vmware") ||
      nombre.toLowerCase().includes("hyper-v") ||
      nombre.toLowerCase().includes("wsl") ||
      nombre.toLowerCase().includes("vethernet") ||
      nombre.toLowerCase().includes("loopback")
    ) {
      continue;
    }

    for (let net of interfaces[nombre]) {
      if (net.family !== "IPv4" || net.internal) continue;
      const ip = net.address;

      if (ip.startsWith("192.168.56.")) continue;

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
  const tipo = socket.handshake.query.tipo;
  const esPantalla = tipo === "pantalla";
  const esGamepad = tipo === "gamepad";

  if (esPantalla) {
    console.log("Videojuego conectado");
    console.log("Reinicio de juego");
    io.emit("servidorReiniciado");
  } else if (esGamepad) {
    if (gamepadsConectados.size >= 4) {
      console.log("Conexion rechazada: sala llena (Máximo de 4 jugadores)");
      socket.disconnect(true);
      return;
    }
    gamepadsConectados.add(socket.id);
    const indice = gamepadsConectados.size - 1;
    console.log(`Gamepad conectado - jugadores: ${gamepadsConectados.size}`);
    io.emit("nuevoJugador", {
      idDelSocket: socket.id,
      color: coloresParaJugadores[indice],
    });
  } else {
    console.log("Conexion ignorada (tipo desconocido)");
  }
  socket.on("pedirJugadoresConectados", () => {
    let indice = 0;
    gamepadsConectados.forEach((id) => {
      socket.emit("nuevoJugador", {
        idDelSocket: id,
        color: coloresParaJugadores[indice],
      });
      indice++;
    });
  });
  socket.on("message", (msg) => {
    io.emit("inputDeJugador", {
      idDelSocket: socket.id,
      tipoDeEvento: msg.tipo,
      teclaPresionada: msg.tecla,
    });
  });

  socket.on("error", (err) => {
    console.log(`error de conexion: ${err.message}`);
  });

  socket.on("disconnect", () => {
    if (esPantalla) {
      console.log("Videojuego desconectado");
    } else if (esGamepad) {
      gamepadsConectados.delete(socket.id);
      console.log(
        `Gamepad desconectado - jugadores: ${gamepadsConectados.size}`,
      );
      io.emit("jugadorDesconectado", socket.id);
    }
  });
});

http.listen(PUERTO, "0.0.0.0", () => {
  console.log(`videojuego funcionando en ${ip}:${PUERTO}`);
  console.log(`conectar gamepads a ${ip}:${PUERTO}`);
});

function cerrarServidor() {
  console.log("Apagando servidor...");

  // Avisar a los clientes (opcional)
  io.emit("servidorApagado");

  // Desconectar todos los sockets
  io.sockets.sockets.forEach((socket) => {
    socket.disconnect(true);
  });

  // Cerrar servidor HTTP
  http.close(() => {
    console.log("Servidor cerrado correctamente");
    process.exit(0);
  });

  // Failsafe (por si algo queda colgado)
  setTimeout(() => {
    console.log("Forzando cierre del servidor");
    process.exit(1);
  }, 3000);
}

// Ctrl + C
process.on("SIGINT", cerrarServidor);

// También cubre kill en algunos sistemas
process.on("SIGTERM", cerrarServidor);
