import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  onSalir: () => void;
};

const BotonParaSalir = ({ onSalir }: Props) => (
  <TouchableOpacity style={estilos.boton} onPress={onSalir}>
    <Text style={estilos.texto}>Salir</Text>
  </TouchableOpacity>
);

const estilos = StyleSheet.create({
  boton: {
    padding: 6,
    backgroundColor: "#cc0000",
    borderRadius: 5,
  },
  texto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BotonParaSalir;
