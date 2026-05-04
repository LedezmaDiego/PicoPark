import React from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { COLORES } from "../../constantes/colores";

type Props = { onCapturarLayout: (evento: LayoutChangeEvent) => void };

const BotonDeAccion = ({ onCapturarLayout }: Props) => (
  <View style={estilos.contenedor} onLayout={onCapturarLayout}>
    <View style={estilos.boton}>
      <Text style={estilos.letra}>A</Text>
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
    backgroundColor: COLORES.BOTON_ACCION,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORES.BOTON_ACCION_BORDE,
  },
  letra: { color: COLORES.TEXTO_CLARO, fontSize: 48, fontWeight: "bold" },
});

export default BotonDeAccion;
