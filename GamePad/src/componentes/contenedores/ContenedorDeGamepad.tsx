import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BotonDeAccion from "../contenidos/BotonDeAccion";
import BotonParaSalir from "../contenidos/BotonParaSalir";
import DPadDeMovimiento from "../contenidos/DPadDeMovimiento";
import IndicadorDeConexion from "../contenidos/IndicadorDeConexion";
import { LayoutChangeEvent } from "react-native";
import BotonParaIniciar from "../contenidos/BotonParaIniciar";

type Props = {
  onSalir: () => void;
  onCapturarLayoutDpad: (e: LayoutChangeEvent) => void;
  onCapturarLayoutSalto: (e: LayoutChangeEvent) => void;
  onCapturarLayoutStart: (e: LayoutChangeEvent) => void;
  onProcesarToques: (e: any) => void;
};

const ContenedorDeGamepad = ({
  onSalir,
  onCapturarLayoutDpad,
  onCapturarLayoutSalto,
  onCapturarLayoutStart,
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
        <DPadDeMovimiento onCapturarLayout={onCapturarLayoutDpad} />
        <BotonParaIniciar onCapturarLayout={onCapturarLayoutStart} />
        <BotonDeAccion onCapturarLayout={onCapturarLayoutSalto} />
      </View>
    </View>
  </SafeAreaView>
);

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#121212",
  },
  barraSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
    zIndex: 10,
  },
  zonaDeControles: {
    flex: 1,
    position: "relative",
  },
  capaVisual: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
});

export default ContenedorDeGamepad;
