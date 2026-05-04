import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  direccionIp: string;
  onCambiarIp: (ip: string) => void;
  onConectarConIp: () => void;
  onAbrirEscanerQR: () => void;
};

const FormularioDeConexion = ({
  direccionIp,
  onCambiarIp,
  onConectarConIp,
  onAbrirEscanerQR,
}: Props) => (
  <View style={estilos.contenedor}>
    <Text style={estilos.titulo}>Vincular GamePad</Text>
    <TextInput
      style={estilos.inputIp}
      placeholder="Coloca la IP (Ej: 192.168.1.39:3000)"
      placeholderTextColor="#aaa"
      value={direccionIp}
      onChangeText={onCambiarIp}
      keyboardType="default"
    />
    <TouchableOpacity
      style={estilos.botonConectarConIp}
      onPress={onConectarConIp}
    >
      <Text style={estilos.textoDeBoton}>Conectar con IP</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={estilos.botonConectarConQR}
      onPress={onAbrirEscanerQR}
    >
      <Text style={estilos.textoDeBoton}>Conectar con QR</Text>
    </TouchableOpacity>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputIp: {
    backgroundColor: "#333",
    color: "#fff",
    width: 500,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  botonConectarConIp: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  botonConectarConQR: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 12,
  },
  textoDeBoton: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FormularioDeConexion;
