import React from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

type Props = {
  onCapturarLayout: (evento: LayoutChangeEvent) => void;
};

const BotonParaIniciar = ({ onCapturarLayout }: Props) => (
  <View style={estilos.contenedorAbsoluto} onLayout={onCapturarLayout}>
    <View style={estilos.boton}>
      <Text style={estilos.texto}>Iniciar</Text>
    </View>
  </View>
);

const estilos = StyleSheet.create({
  contenedorAbsoluto: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  boton: {
    width: 100,
    height: 40,
    backgroundColor: "#444",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },
  texto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default BotonParaIniciar;
