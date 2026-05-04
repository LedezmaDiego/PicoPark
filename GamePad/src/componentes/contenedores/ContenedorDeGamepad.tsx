import React from "react";
import {
  StyleSheet,
  View,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BotonDeAccion from "../contenidos/BotonDeAccion";
import BotonParaSalir from "../contenidos/BotonParaSalir";
import DPadDeMovimiento from "../contenidos/DPadDeMovimiento";
import IndicadorDeConexion from "../contenidos/IndicadorDeConexion";
import { COLORES } from "../../constantes/colores";

type Props = {
  onSalir: () => void;
  onCapturarLayoutDpad: (e: LayoutChangeEvent) => void;
  onCapturarLayoutArriba: (e: LayoutChangeEvent) => void;
  onCapturarLayoutAbajo: (e: LayoutChangeEvent) => void;
  onCapturarLayoutIzquierda: (e: LayoutChangeEvent) => void;
  onCapturarLayoutDerecha: (e: LayoutChangeEvent) => void;
  onCapturarLayoutSalto: (e: LayoutChangeEvent) => void;
  onProcesarToques: (e: GestureResponderEvent) => void;
};

const ContenedorDeGamepad = ({
  onSalir,
  onCapturarLayoutDpad,
  onCapturarLayoutArriba,
  onCapturarLayoutAbajo,
  onCapturarLayoutIzquierda,
  onCapturarLayoutDerecha,
  onCapturarLayoutSalto,
  onProcesarToques,
}: Props) => (
  <SafeAreaView style={estilos.contenedor}>
    <View style={estilos.barraSuperior}>
      <IndicadorDeConexion />
      <BotonParaSalir onSalir={onSalir} />
    </View>
    <View
      style={estilos.zonaDeControles}
      onTouchStart={onProcesarToques}
      onTouchMove={onProcesarToques}
      onTouchEnd={onProcesarToques}
      onTouchCancel={onProcesarToques}
    >
      <View style={estilos.capaVisual} pointerEvents="none">
        <DPadDeMovimiento
          onCapturarLayout={onCapturarLayoutDpad}
          onCapturarLayoutArriba={onCapturarLayoutArriba}
          onCapturarLayoutAbajo={onCapturarLayoutAbajo}
          onCapturarLayoutIzquierda={onCapturarLayoutIzquierda}
          onCapturarLayoutDerecha={onCapturarLayoutDerecha}
        />
        <BotonDeAccion onCapturarLayout={onCapturarLayoutSalto} />
      </View>
    </View>
  </SafeAreaView>
);

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.FONDO_PRINCIPAL },
  barraSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
    zIndex: 10,
  },
  zonaDeControles: { flex: 1, position: "relative" },
  capaVisual: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 60,
    paddingBottom: 20,
  },
});

export default ContenedorDeGamepad;
