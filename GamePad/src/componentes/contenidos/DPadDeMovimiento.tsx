import { Feather } from "@expo/vector-icons";
import React from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

type Props = {
  onCapturarLayout: (evento: LayoutChangeEvent) => void;
};

const DPadDeMovimiento = ({ onCapturarLayout }: Props) => (
  <View style={estilos.contenedor} onLayout={onCapturarLayout}>
    <View style={estilos.fila}>
      <View style={estilos.botonDireccion}>
        <Feather name="chevron-up" size={42} color="#555" />
      </View>
    </View>
    <View style={estilos.filaCentro}>
      <View style={estilos.botonDireccion}>
        <Feather name="chevron-left" size={42} color="white" />
      </View>
      <View style={estilos.espacioVacio} />
      <View style={estilos.botonDireccion}>
        <Feather name="chevron-right" size={42} color="white" />
      </View>
    </View>
    <View style={estilos.fila}>
      <View style={estilos.botonDireccion}>
        <Feather name="chevron-down" size={42} color="#555" />
      </View>
    </View>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "center",
  },
  filaCentro: {
    flexDirection: "row",
    alignItems: "center",
  },
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
  espacioVacio: {
    width: 65,
    height: 65,
    margin: 2,
  },
});

export default DPadDeMovimiento;
