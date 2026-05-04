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

export default function App() {
  useKeepAwake();

  const [direccionIp, setDireccionIp] = useState("192.168.1.39:3000");
  const [estaConectado, setEstaConectado] = useState(false);
  const [estadoDeConexion, setEstadoDeConexion] = useState("Desconectado");

  const socketRef = useRef(null);
  const teclasActivasRef = useRef(new Set());

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
    );
    return () => ScreenOrientation.unlockAsync();
  }, []);

  const conectarAlServidor = useCallback(() => {
    if (!direccionIp || socketRef.current) {
      if (socketRef.current) socketRef.current.disconnect();
      return;
    }
    setEstadoDeConexion("Conectando...");
    socketRef.current = io(`http://${direccionIp}`, {
      transports: ["websocket"],
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
    socketRef.current.on("connect_error", () => {
      setEstaConectado(false);
      setEstadoDeConexion("Error de red");
    });
  }, [direccionIp]);

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

  const procesarToquesGlobables = (e) => {
    const touches = e.nativeEvent.touches;
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

    let nuevasTeclas = new Set();

    for (let i = 0; i < touches.length; i++) {
      const { pageX, pageY } = touches[i];

      // 1. ZONA START (Arriba al centro, alineado con lo visual)
      const startW = 120; const startH = 60;
      const startX = (screenWidth / 2) - (startW / 2);
      const startY = 10; 

      const tocandoStart = pageX >= startX && pageX <= startX + startW &&
                           pageY >= startY && pageY <= startY + startH;

      if (tocandoStart) {
        nuevasTeclas.add("Enter"); 
        continue; 
      }

      // 2. ZONA ACCIÓN / SALTO (Mitad derecha)
      if (pageX > screenWidth / 2) {
        nuevasTeclas.add("Space"); 
      } 
      // 3. ZONA D-PAD (Mitad izquierda, abajo)
      else {
        const centroX = 150;
        const centroY = screenHeight - 120;

        const diffX = pageX - centroX;
        const diffY = pageY - centroY;

        if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) continue;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) nuevasTeclas.add("ArrowRight");
          else nuevasTeclas.add("ArrowLeft");
        } else {
          if (diffY > 0) nuevasTeclas.add("ArrowDown");
          else nuevasTeclas.add("ArrowUp");
        }
      }
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

  if (!estaConectado) {
    return (
      <SafeAreaView style={styles.contenedorCentro}>
        <StatusBar style="dark" hidden={true} />
        <Text style={styles.tituloSecundario}>Vincular Gamepad ETEC</Text>
        <TextInput
          style={styles.inputIp}
          placeholder="Ej: 192.168.1.39:3000"
          value={direccionIp}
          onChangeText={setDireccionIp}
          keyboardType="default"
        />
        <TouchableOpacity
          style={styles.botonConectar}
          onPress={conectarAlServidor}
        >
          <Text style={styles.textoBotonSecundario}>Conectar</Text>
        </TouchableOpacity>
        <Text style={styles.textoEstado}>{estadoDeConexion}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedorGamepad}>
      <StatusBar hidden={true} />
      
      <View style={styles.barraSuperior}>
        <View style={styles.indicadorLed}>
          <View style={[styles.led, styles.ledEncendido]} />
          <Text style={styles.textoLed}>P1</Text>
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
          
          <View style={styles.zonaDPad}>
            <View style={styles.filaDPad}>
              <View style={styles.botonDireccion}><Feather name="chevron-up" size={42} color="#555" /></View>
            </View>
            <View style={styles.filaCentroDPad}>
              <View style={styles.botonDireccion}><Feather name="chevron-left" size={42} color="white" /></View>
              <View style={styles.centroDPadVacio} />
              <View style={styles.botonDireccion}><Feather name="chevron-right" size={42} color="white" /></View>
            </View>
            <View style={styles.filaDPad}>
              <View style={styles.botonDireccion}><Feather name="chevron-down" size={42} color="#555" /></View>
            </View>
          </View>

          {/* BOTÓN START CORREGIDO (Arriba al centro) */}
          <View style={styles.contenedorStartVisual}>
            <View style={styles.botonStartVisual}>
                <Text style={styles.textoStartVisual}>START</Text>
            </View>
          </View>

          <View style={styles.zonaAccion}>
            <View style={styles.botonAccion}>
              <Feather name="triangle" size={40} color="white" style={{transform: [{rotate: '90deg'}]}} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorCentro: { flex: 1, backgroundColor: "#1e1e1e", justifyContent: "center", alignItems: "center" },
  tituloSecundario: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 20 },
  inputIp: { backgroundColor: "#333", color: "#fff", width: 250, padding: 15, borderRadius: 8, fontSize: 18, textAlign: "center", marginBottom: 20 },
  botonConectar: { backgroundColor: "#007AFF", paddingVertical: 15, paddingHorizontal: 40, borderRadius: 8 },
  textoBotonSecundario: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  textoEstado: { color: "#aaa", marginTop: 20 },
  contenedorGamepad: { flex: 1, backgroundColor: "#121212" },
  barraSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems:'center', paddingHorizontal: 20, paddingTop: 10, height: 50, zIndex: 10 },
  indicadorLed: { flexDirection: "row", alignItems: "center", backgroundColor:'rgba(0,0,0,0.5)', padding:5, borderRadius:10 },
  led: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  ledEncendido: { backgroundColor: "#00FF00", shadowColor: "#00FF00", shadowOpacity: 0.8, shadowRadius: 5 },
  textoLed: { color: "#fff", fontWeight: "bold", fontSize:12 },
  botonDesconectarFantasmal: { padding: 6, backgroundColor: "#cc0000", borderRadius: 5 },
  textoDesconectar: { color: "#fff", fontSize: 10, fontWeight:'bold' },
  zonaControles: { flex: 1, position: "relative" },
  capaVisualFantasmal: { ...StyleSheet.absoluteFillObject, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 30, paddingBottom: 20 },
  zonaDPad: { alignItems: "center", justifyContent: "center", opacity: 0.8 },
  filaDPad: { flexDirection: "row", justifyContent: "center" },
  filaCentroDPad: { flexDirection: "row", alignItems: "center" },
  botonDireccion: { width: 65, height: 65, backgroundColor: "#222", justifyContent: "center", alignItems: "center", margin: 2, borderRadius: 10, borderWidth:1, borderColor:'#333' },
  centroDPadVacio: { width: 65, height: 65, margin: 2 },
  
  // Modificado: Arriba en el medio exacto de la pantalla
  contenedorStartVisual: { position:'absolute', top: 10, left: (Dimensions.get('window').width / 2) - 60, width:120, alignItems:'center'},
  botonStartVisual: { width: 100, height: 40, backgroundColor: "#444", borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth:1, borderColor:'#555'},
  textoStartVisual: { color: '#aaa', fontSize: 16, fontWeight: 'bold', letterSpacing: 1},

  zonaAccion: { alignItems: "center", justifyContent: "center", paddingRight: 10 },
  botonAccion: { width: 100, height: 100, backgroundColor: "#E74C3C", borderRadius: 50, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 8, borderWidth:2, borderColor:'#b03a2e' },
});