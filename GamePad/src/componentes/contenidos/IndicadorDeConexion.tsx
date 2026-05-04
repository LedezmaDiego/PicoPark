import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORES } from "../../constantes/colores";

const IndicadorDeConexion = () => (
  <View style={estilos.contenedor}>
    <View style={estilos.led} />
    <Text style={estilos.texto}>Conectado</Text>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 10,
  },
  led: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    backgroundColor: COLORES.CONEXION_ACTIVA,
    shadowColor: COLORES.CONEXION_ACTIVA,
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  texto: { color: COLORES.TEXTO_CLARO, fontWeight: "bold", fontSize: 12 },
});

export default IndicadorDeConexion;
