import { Feather } from "@expo/vector-icons";
import React from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

type Props = {
  onCapturarLayout: (evento: LayoutChangeEvent) => void;
};

const BotonDeAccion = ({ onCapturarLayout }: Props) => (
  <View style={estilos.contenedor} onLayout={onCapturarLayout}>
    <View style={estilos.boton}>
      <Feather name="triangle" size={40} color="white" style={estilos.icono} />
    </View>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 10,
  },
  boton: {
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
  icono: {
    transform: [{ rotate: "90deg" }],
  },
});

export default BotonDeAccion;
