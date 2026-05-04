import { useRef } from "react";
import { GestureResponderEvent, LayoutChangeEvent } from "react-native";
import { ZONA_MUERTA_DPAD } from "../constantes/configDeRed";
import { LayoutDeZona } from "../tipos";

const useControlesDeGamepad = (
  alPresionarTecla: (tecla: string) => void,
  alSoltarTecla: (tecla: string) => void,
) => {
  const layoutDpad = useRef<LayoutDeZona | null>(null);
  const layoutBotonSalto = useRef<LayoutDeZona | null>(null);
  const layoutBotonStart = useRef<LayoutDeZona | null>(null);
  const teclasActivasRef = useRef<Set<string>>(new Set());

  const estaEnZona = (
    px: number,
    py: number,
    zona: LayoutDeZona | null,
  ): boolean => {
    if (!zona) return false;
    return (
      px >= zona.x &&
      px <= zona.x + zona.width &&
      py >= zona.y &&
      py <= zona.y + zona.height
    );
  };

  const capturarLayoutDeZona =
    (ref: React.MutableRefObject<LayoutDeZona | null>) =>
    (evento: LayoutChangeEvent) => {
      (
        evento.target as unknown as {
          measure: (
            cb: (
              _fx: number,
              _fy: number,
              w: number,
              h: number,
              px: number,
              py: number,
            ) => void,
          ) => void;
        }
      ).measure((_fx, _fy, w, h, px, py) => {
        ref.current = { x: px, y: py, width: w, height: h };
      });
    };

  const calcularDireccionDpad = (px: number, py: number): string | null => {
    const zona = layoutDpad.current;
    if (!zona) return null;

    const centroDpadX = zona.x + zona.width / 2;
    const centroDpadY = zona.y + zona.height / 2;
    const diffX = px - centroDpadX;
    const diffY = py - centroDpadY;

    const estaEnZonaMuerta =
      Math.abs(diffX) < ZONA_MUERTA_DPAD && Math.abs(diffY) < ZONA_MUERTA_DPAD;
    if (estaEnZonaMuerta) return null;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      return diffX > 0 ? "ArrowRight" : "ArrowLeft";
    }
    return diffY > 0 ? "ArrowDown" : "ArrowUp";
  };

  const resolverTeclasActivas = (touches: React.Touch[]): Set<string> => {
    const teclasNuevas = new Set<string>();

    for (const toque of touches) {
      const { pageX, pageY } = toque;

      if (estaEnZona(pageX, pageY, layoutBotonStart.current)) {
        teclasNuevas.add("Enter");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutBotonSalto.current)) {
        teclasNuevas.add("Space");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutDpad.current)) {
        const direccion = calcularDireccionDpad(pageX, pageY);
        if (direccion) teclasNuevas.add(direccion);
      }
    }

    return teclasNuevas;
  };

  const procesarToques = (evento: GestureResponderEvent) => {
    const teclasNuevas = resolverTeclasActivas(evento.nativeEvent.touches);
    if (evento.nativeEvent.touches.length === 0) {
      teclasActivasRef.current.forEach((tecla) => alSoltarTecla(tecla));
      teclasActivasRef.current = new Set();
      return;
    }
    teclasActivasRef.current.forEach((teclaVieja) => {
      if (!teclasNuevas.has(teclaVieja)) alSoltarTecla(teclaVieja);
    });
    teclasNuevas.forEach((teclaNueva) => {
      if (!teclasActivasRef.current.has(teclaNueva))
        alPresionarTecla(teclaNueva);
    });

    teclasActivasRef.current = teclasNuevas;
  };

  return {
    layoutDpad,
    layoutBotonSalto,
    layoutBotonStart,
    capturarLayoutDeZona,
    procesarToques,
  };
};

export default useControlesDeGamepad;
