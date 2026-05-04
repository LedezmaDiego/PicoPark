import { useCallback, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  IP_PLACEHOLDER,
  TIPO_CONEXION_GAMEPAD,
  TIPO_TRANSPORTE_WEBSOCKET,
} from "../constantes/configDeRed";
import { EstadoDeConexion } from "../tipos";

const useConexionAlServidor = () => {
  const [estaConectado, setEstaConectado] = useState(false);
  const [estadoDeConexion, setEstadoDeConexion] =
    useState<EstadoDeConexion>("Desconectado");
  const [direccionIp, setDireccionIp] = useState(IP_PLACEHOLDER);
  const socketRef = useRef<Socket | null>(null);

  const desconectarSocketActual = () => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners(); // ← agregar esto
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const registrarEventosDeSocket = (socket: Socket) => {
    socket.on("connect", () => {
      setEstaConectado(true);
      setEstadoDeConexion("Conectado");
    });

    socket.on("disconnect", () => {
      setEstaConectado(false);
      setEstadoDeConexion("Desconectado");
    });

    socket.on("servidorApagado", () => {
      setEstaConectado(false);
      setEstadoDeConexion("Servidor apagado");
      socketRef.current = null;
    });

    socket.on("connect_error", () => {
      setEstaConectado(false);
      setEstadoDeConexion("Error de red");
    });

    socket.io.on("reconnect_attempt", () => {
      console.log("Reintentando conexión...");
    });
  };

  const conectarAlServidor = useCallback(
    (ipOverride?: string) => {
      const ipDestino = ipOverride ?? direccionIp;
      if (!ipDestino) return;

      desconectarSocketActual();
      setEstadoDeConexion("Conectando...");

      const socketNuevo = io(`http://${ipDestino}`, {
        transports: [TIPO_TRANSPORTE_WEBSOCKET],
        query: { tipo: TIPO_CONEXION_GAMEPAD },
      });

      socketRef.current = socketNuevo;
      registrarEventosDeSocket(socketNuevo);
    },
    [direccionIp],
  );

  const desconectarDelServidor = () => {
    desconectarSocketActual();
    setEstaConectado(false);
    setEstadoDeConexion("Desconectado");
  };

  const enviarEventoDeControl = (
    tipoDeEvento: "keydown" | "keyup",
    tecla: string,
  ) => {
    if (socketRef.current && estaConectado) {
      socketRef.current.emit("message", { tipo: tipoDeEvento, tecla });
    }
  };

  return {
    estaConectado,
    estadoDeConexion,
    direccionIp,
    setDireccionIp,
    socketRef,
    conectarAlServidor,
    desconectarDelServidor,
    enviarEventoDeControl,
  };
};

export default useConexionAlServidor;
