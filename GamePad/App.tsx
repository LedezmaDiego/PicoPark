import React from "react";
import { StatusBar } from "expo-status-bar";
import ContenedorDeGamepad from "@/src/componentes/contenedores/ContenedorDeGamepad";
import FormularioDeConexion from "@/src/componentes/contenidos/FormularioDeConexion";
import PantallaDeEscaneoQR from "@/src/componentes/contenidos/PantallaDeEscaneoQR";
import useConexionAlServidor from "@/src/hooks/useConexionAlServidor";
import useEscanerQR from "@/src/hooks/useEscanerQR";
import useControlesDeGamepad from "@/src/hooks/useControlesDeGamepad";

const App = () => {
  const {
    estaConectado,
    direccionIp,
    setDireccionIp,
    conectarAlServidor,
    desconectarDelServidor,
    enviarEventoDeControl,
  } = useConexionAlServidor();

  const handleIpEscaneada = (ip: string) => {
    setDireccionIp(ip);
    conectarAlServidor(ip);
  };

  const { estaEscaneando, abrirEscanerQR, cerrarEscanerQR, handleQREscaneado } =
    useEscanerQR(handleIpEscaneada);

  const {
    layoutDpad,
    layoutBotonSalto,
    layoutBotonArriba,
    layoutBotonAbajo,
    layoutBotonIzquierda,
    layoutBotonDerecha,
    capturarLayoutDeZona,
    procesarToques,
  } = useControlesDeGamepad(
    (tecla) => enviarEventoDeControl("keydown", tecla),
    (tecla) => enviarEventoDeControl("keyup", tecla),
  );

  if (!estaConectado && estaEscaneando) {
    return (
      <>
        <StatusBar hidden />
        <PantallaDeEscaneoQR
          onQREscaneado={handleQREscaneado}
          onCancelar={cerrarEscanerQR}
        />
      </>
    );
  }

  if (!estaConectado) {
    return (
      <>
        <StatusBar hidden />
        <FormularioDeConexion
          direccionIp={direccionIp}
          onCambiarIp={setDireccionIp}
          onConectarConIp={() => conectarAlServidor()}
          onAbrirEscanerQR={abrirEscanerQR}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar hidden />
      <ContenedorDeGamepad
        onSalir={desconectarDelServidor}
        onCapturarLayoutDpad={capturarLayoutDeZona(layoutDpad)}
        onCapturarLayoutArriba={capturarLayoutDeZona(layoutBotonArriba)}
        onCapturarLayoutAbajo={capturarLayoutDeZona(layoutBotonAbajo)}
        onCapturarLayoutIzquierda={capturarLayoutDeZona(layoutBotonIzquierda)}
        onCapturarLayoutDerecha={capturarLayoutDeZona(layoutBotonDerecha)}
        onCapturarLayoutSalto={capturarLayoutDeZona(layoutBotonSalto)}
        onProcesarToques={procesarToques}
      />
    </>
  );
};

export default App;
