import { CameraView, useCameraPermissions } from "expo-camera";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  onQREscaneado: (data: { data: string }) => void;
  onCancelar: () => void;
};

const PantallaDeEscaneoQR = ({ onQREscaneado, onCancelar }: Props) => {
  const [permiso] = useCameraPermissions();

  if (!permiso?.granted) {
    return (
      <SafeAreaView style={estilos.contenedor}>
        <View style={estilos.centrado}>
          <Text style={estilos.textoSinPermiso}>Sin permiso de cámara</Text>
          <TouchableOpacity style={estilos.botonCancelar} onPress={onCancelar}>
            <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.contenedor}>
      <CameraView
        style={estilos.camara}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={onQREscaneado}
      />
      <TouchableOpacity style={estilos.botonCancelar} onPress={onCancelar}>
        <Text style={estilos.textoBotonCancelar}>Cancelar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#000",
  },
  camara: {
    flex: 1,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoSinPermiso: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  botonCancelar: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#cc0000",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  textoBotonCancelar: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PantallaDeEscaneoQR;
