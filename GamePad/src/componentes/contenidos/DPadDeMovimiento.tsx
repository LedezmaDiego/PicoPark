import { Feather } from "@expo/vector-icons";
import React from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { COLORES } from "../../constantes/colores";

type Props = {
  onCapturarLayout: (evento: LayoutChangeEvent) => void;
  onCapturarLayoutArriba: (evento: LayoutChangeEvent) => void;
  onCapturarLayoutAbajo: (evento: LayoutChangeEvent) => void;
  onCapturarLayoutIzquierda: (evento: LayoutChangeEvent) => void;
  onCapturarLayoutDerecha: (evento: LayoutChangeEvent) => void;
};

const DPadDeMovimiento = ({
  onCapturarLayout,
  onCapturarLayoutArriba,
  onCapturarLayoutAbajo,
  onCapturarLayoutIzquierda,
  onCapturarLayoutDerecha,
}: Props) => (
  <View style={estilos.contenedor} onLayout={onCapturarLayout}>
    <View style={estilos.fila}>
      <View style={estilos.botonDireccion} onLayout={onCapturarLayoutArriba}>
        <Feather name="chevron-up" size={42} color={COLORES.TEXTO_CLARO} />
      </View>
    </View>
    <View style={estilos.filaCentro}>
      <View style={estilos.botonDireccion} onLayout={onCapturarLayoutIzquierda}>
        <Feather name="chevron-left" size={42} color={COLORES.TEXTO_CLARO} />
      </View>
      <View style={estilos.espacioVacio} />
      <View style={estilos.botonDireccion} onLayout={onCapturarLayoutDerecha}>
        <Feather name="chevron-right" size={42} color={COLORES.TEXTO_CLARO} />
      </View>
    </View>
    <View style={estilos.fila}>
      <View style={estilos.botonDireccion} onLayout={onCapturarLayoutAbajo}>
        <Feather name="chevron-down" size={42} color={COLORES.TEXTO_CLARO} />
      </View>
    </View>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: { alignItems: "center", justifyContent: "center", opacity: 0.8 },
  fila: { flexDirection: "row", justifyContent: "center" },
  filaCentro: { flexDirection: "row", alignItems: "center" },
  botonDireccion: {
    width: 65,
    height: 65,
    backgroundColor: COLORES.DPAD_FONDO,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES.DPAD_BORDE,
  },
  espacioVacio: { width: 65, height: 65, margin: 2 },
});

export default DPadDeMovimiento;
