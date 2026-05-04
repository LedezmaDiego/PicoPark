import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORES } from "../../constantes/colores";

type Props = { onSalir: () => void };

const BotonParaSalir = ({ onSalir }: Props) => (
  <TouchableOpacity style={estilos.boton} onPress={onSalir}>
    <Text style={estilos.texto}>Salir</Text>
  </TouchableOpacity>
);

const estilos = StyleSheet.create({
  boton: { padding: 6, backgroundColor: COLORES.BOTON_SALIR, borderRadius: 5 },
  texto: { color: COLORES.TEXTO_CLARO, fontSize: 16, fontWeight: "bold" },
});

export default BotonParaSalir;
