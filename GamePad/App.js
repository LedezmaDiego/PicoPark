import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { useKeepAwake } from "expo-keep-awake";
import { Feather } from "@expo/vector-icons";
import { io } from "socket.io-client";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function App() {
  useKeepAwake();

  const [direccionIp, setDireccionIp] = useState("192.168.:3000");
  const [estaConectado, setEstaConectado] = useState(false);
  const [estadoDeConexion, setEstadoDeConexion] = useState("Desconectado");
  const [escaneandoQR, setEscaneandoQR] = useState(false);
  const [permisoCamera, solicitarPermisoCamera] = useCameraPermissions();

  // Guardamos el layout real de cada zona
  const layoutDpad = useRef(null);
  const layoutJump = useRef(null);
  const layoutStart = useRef(null);

  const socketRef = useRef(null);
  const teclasActivasRef = useRef(new Set());

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
    );
    return () => ScreenOrientation.unlockAsync();
  }, []);

  const abrirEscanerQR = async () => {
    if (!permisoCamera?.granted) {
      const resultado = await solicitarPermisoCamera();
      if (!resultado.granted) return;
    }
    setEscaneandoQR(true);
  };

  const onQREscaneado = ({ data }) => {
    setEscaneandoQR(false);
    // Sacar el "http://" si viene en el QR
    const ipLimpia = data.replace("http://", "").replace("https://", "");
    setDireccionIp(ipLimpia);
    conectarAlServidor(ipLimpia);
  };

  const conectarAlServidor = useCallback(
    (ipOverride) => {
      const ip = ipOverride || direccionIp;
      if (!ip) return;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setEstadoDeConexion("Conectando...");

      socketRef.current = io(`http://${ip}`, {
        transports: ["websocket"],
        query: { tipo: "gamepad" },
      });

      socketRef.current.on("connect", () => {
        setEstaConectado(true);
        setEstadoDeConexion("Conectado");
      });

      socketRef.current.on("disconnect", () => {
        setEstaConectado(false);
        setEstadoDeConexion("Desconectado");
        teclasActivasRef.current.clear();
      });

      socketRef.current.on("servidorApagado", () => {
        setEstaConectado(false);
        setEstadoDeConexion("Servidor apagado");
        teclasActivasRef.current.clear();
        socketRef.current = null;
      });

      socketRef.current.io.on("reconnect_attempt", () => {
        console.log("Reintentando conexión...");
      });

      socketRef.current.on("connect_error", () => {
        setEstaConectado(false);
        setEstadoDeConexion("Error de red");
      });
    },
    [direccionIp],
  );

  const desconectarDelServidor = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setEstaConectado(false);
    setEstadoDeConexion("Desconectado");
    teclasActivasRef.current.clear();
  };

  const enviarEventoPresionar = (tecla) => {
    if (socketRef.current && estaConectado) {
      socketRef.current.emit("message", { tipo: "keydown", tecla });
    }
  };

  const enviarEventoSoltar = (tecla) => {
    if (socketRef.current && estaConectado) {
      socketRef.current.emit("message", { tipo: "keyup", tecla });
    }
  };

  const estaEnRect = (px, py, layout) => {
    if (!layout) return false;
    return (
      px >= layout.x &&
      px <= layout.x + layout.width &&
      py >= layout.y &&
      py <= layout.y + layout.height
    );
  };

  const procesarToquesGlobables = (e) => {
    const touches = e.nativeEvent.touches;
    let nuevasTeclas = new Set();

    for (let i = 0; i < touches.length; i++) {
      const { pageX, pageY } = touches[i];

      // 1. START
      if (estaEnRect(pageX, pageY, layoutStart.current)) {
        nuevasTeclas.add("Enter");
        continue;
      }

      // 2. SALTO
      if (estaEnRect(pageX, pageY, layoutJump.current)) {
        nuevasTeclas.add("Space");
        continue;
      }

      // 3. D-PAD
      if (estaEnRect(pageX, pageY, layoutDpad.current)) {
        const l = layoutDpad.current;
        const centroDpadX = l.x + l.width / 2;
        const centroDpadY = l.y + l.height / 2;
        const diffX = pageX - centroDpadX;
        const diffY = pageY - centroDpadY;

        // Zona muerta central
        if (Math.abs(diffX) < 25 && Math.abs(diffY) < 25) continue;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) nuevasTeclas.add("ArrowRight");
          else nuevasTeclas.add("ArrowLeft");
        } else {
          if (diffY > 0) nuevasTeclas.add("ArrowDown");
          else nuevasTeclas.add("ArrowUp");
        }
      }
      // Toque fuera de toda zona → se ignora
    }

    teclasActivasRef.current.forEach((teclaVieja) => {
      if (!nuevasTeclas.has(teclaVieja)) {
        enviarEventoSoltar(teclaVieja);
      }
    });
    nuevasTeclas.forEach((teclaNueva) => {
      if (!teclasActivasRef.current.has(teclaNueva)) {
        enviarEventoPresionar(teclaNueva);
      }
    });
    teclasActivasRef.current = nuevasTeclas;
  };

  const capturarLayout = (ref) => (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // pageX/pageY en onLayout no existe, usamos measure para coords absolutas
    event.target.measure((fx, fy, w, h, px, py) => {
      ref.current = { x: px, y: py, width: w, height: h };
    });
  };

  if (!estaConectado) {
    // Pantalla del escáner QR
    if (escaneandoQR) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <StatusBar hidden={true} />
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onQREscaneado}
          />
          <TouchableOpacity
            style={styles.botonCancelarQR}
            onPress={() => setEscaneandoQR(false)}
          >
            <Text style={styles.textoBotonSecundario}>Cancelar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    // Pantalla normal de conexión
    return (
      <SafeAreaView style={styles.contenedorCentro}>
        <StatusBar style="dark" hidden={true} />
        <Text style={styles.tituloSecundario}>Vincular GamePad</Text>
        <TextInput
          style={styles.inputIp}
          placeholder="Ej: 192.168.1.39:3000"
          placeholderTextColor="#aaa"
          value={direccionIp}
          onChangeText={setDireccionIp}
          keyboardType="default"
        />
        <TouchableOpacity
          style={styles.botonConectar}
          onPress={() => conectarAlServidor()}
        >
          <Text style={styles.textoBotonSecundario}>Conectar con IP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonQR} onPress={abrirEscanerQR}>
          <Text style={styles.textoBotonSecundario}>Conectar con QR</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedorGamepad}>
      <StatusBar hidden={true} />

      <View style={styles.barraSuperior}>
        <View style={styles.indicadorLed}>
          <View style={[styles.led, styles.ledEncendido]} />
          <Text style={styles.textoLed}>Conectado</Text>
        </View>
        <View style={styles.botonDesconectarFantasmal}>
          <TouchableOpacity onPress={desconectarDelServidor}>
            <Text style={styles.textoDesconectar}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={styles.zonaControles}
        onTouchStart={procesarToquesGlobables}
        onTouchMove={procesarToquesGlobables}
        onTouchEnd={procesarToquesGlobables}
        onTouchCancel={procesarToquesGlobables}
      >
        <View style={styles.capaVisualFantasmal} pointerEvents="none">
          {/* D-PAD — capturamos su posición real en pantalla */}
          <View style={styles.zonaDPad} onLayout={capturarLayout(layoutDpad)}>
            <View style={styles.filaDPad}>
              <View style={styles.botonDireccion}>
                <Feather name="chevron-up" size={42} color="#555" />
              </View>
            </View>
            <View style={styles.filaCentroDPad}>
              <View style={styles.botonDireccion}>
                <Feather name="chevron-left" size={42} color="white" />
              </View>
              <View style={styles.centroDPadVacio} />
              <View style={styles.botonDireccion}>
                <Feather name="chevron-right" size={42} color="white" />
              </View>
            </View>
            <View style={styles.filaDPad}>
              <View style={styles.botonDireccion}>
                <Feather name="chevron-down" size={42} color="#555" />
              </View>
            </View>
          </View>

          {/* START centrado */}
          <View
            style={styles.contenedorStartVisual}
            onLayout={capturarLayout(layoutStart)}
          >
            <View style={styles.botonStartVisual}>
              <Text style={styles.textoStartVisual}>Iniciar</Text>
            </View>
          </View>

          {/* BOTÓN SALTO — capturamos su posición real */}
          <View style={styles.zonaAccion} onLayout={capturarLayout(layoutJump)}>
            <View style={styles.botonAccion}>
              <Feather
                name="triangle"
                size={40}
                color="white"
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorCentro: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  tituloSecundario: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputIp: {
    backgroundColor: "#333",
    color: "#fff",
    width: 250,
    padding: 15,
    borderRadius: 8,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  botonConectar: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  textoBotonSecundario: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  textoEstado: { color: "#aaa", marginTop: 20 },
  contenedorGamepad: { flex: 1, backgroundColor: "#121212" },
  barraSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
    zIndex: 10,
  },
  indicadorLed: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 10,
  },
  led: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  ledEncendido: {
    backgroundColor: "#00FF00",
    shadowColor: "#00FF00",
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  textoLed: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  botonDesconectarFantasmal: {
    padding: 6,
    backgroundColor: "#cc0000",
    borderRadius: 5,
  },
  textoDesconectar: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  zonaControles: { flex: 1, position: "relative" },
  capaVisualFantasmal: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  zonaDPad: { alignItems: "center", justifyContent: "center", opacity: 0.8 },
  filaDPad: { flexDirection: "row", justifyContent: "center" },
  filaCentroDPad: { flexDirection: "row", alignItems: "center" },
  botonDireccion: {
    width: 65,
    height: 65,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  centroDPadVacio: { width: 65, height: 65, margin: 2 },
  contenedorStartVisual: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  botonStartVisual: {
    width: 100,
    height: 40,
    backgroundColor: "#444",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },
  textoStartVisual: {
    color: "#aaa",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  zonaAccion: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 10,
  },
  botonAccion: {
    width: 100,
    height: 100,
    backgroundColor: "#E74C3C",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#b03a2e",
  },
  botonQR: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 12,
  },
  botonCancelarQR: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#cc0000",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
});
