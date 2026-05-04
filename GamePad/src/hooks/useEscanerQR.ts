import { useCameraPermissions } from "expo-camera";
import { useState } from "react";

const useEscanerQR = (alEscanearIp: (ip: string) => void) => {
  const [estaEscaneando, setEstaEscaneando] = useState(false);
  const [permisoDeCamera, solicitarPermisoDeCamera] = useCameraPermissions();

  const abrirEscanerQR = async () => {
    if (!permisoDeCamera?.granted) {
      const resultado = await solicitarPermisoDeCamera();
      if (!resultado.granted) return;
    }
    setEstaEscaneando(true);
  };

  const cerrarEscanerQR = () => setEstaEscaneando(false);

  const limpiarPrefijosDeUrl = (url: string) =>
    url.replace("http://", "").replace("https://", "");

  const handleQREscaneado = ({ data }: { data: string }) => {
    const ipLimpia = limpiarPrefijosDeUrl(data);
    setEstaEscaneando(false);
    alEscanearIp(ipLimpia);
  };

  return {
    estaEscaneando,
    abrirEscanerQR,
    cerrarEscanerQR,
    handleQREscaneado,
  };
};

export default useEscanerQR;
