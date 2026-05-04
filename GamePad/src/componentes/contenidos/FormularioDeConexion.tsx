import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORES } from "../../constantes/colores";

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
    <View style={estilos.filaInput}>
      <TextInput
        style={estilos.inputIp}
        placeholder="Coloca la IP (Ej: 192.168.1.39:3000)"
        placeholderTextColor={COLORES.TEXTO_PLACEHOLDER}
        value={direccionIp}
        onChangeText={onCambiarIp}
        keyboardType="default"
      />
      <TouchableOpacity
        style={estilos.botonConectarConIp}
        onPress={onConectarConIp}
      >
        <Text style={estilos.textoDeBoton}>Vincular con IP</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity
      style={estilos.botonConectarConQR}
      onPress={onAbrirEscanerQR}
    >
      <Text style={estilos.textoDeBoton}>Vincular con QR</Text>
    </TouchableOpacity>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.FONDO_FORMULARIO,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 24,
    color: COLORES.TEXTO_CLARO,
    fontWeight: "bold",
    marginBottom: 20,
  },
  filaInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  inputIp: {
    backgroundColor: COLORES.INPUT_FONDO,
    color: COLORES.TEXTO_CLARO,
    width: 400,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    textAlign: "center",
  },
  botonConectarConIp: {
    backgroundColor: COLORES.CONECTAR_IP,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  botonConectarConQR: {
    backgroundColor: COLORES.CONECTAR_QR,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 12,
  },
  textoDeBoton: {
    color: COLORES.TEXTO_CLARO,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FormularioDeConexion;
