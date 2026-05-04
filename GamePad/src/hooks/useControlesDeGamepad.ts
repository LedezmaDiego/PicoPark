import { useRef, RefObject } from "react";
import { LayoutDeZona } from "../tipos";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeTouchEvent,
} from "react-native";

const useControlesDeGamepad = (
  alPresionarTecla: (tecla: string) => void,
  alSoltarTecla: (tecla: string) => void,
) => {
  const layoutDpad = useRef<LayoutDeZona | null>(null);
  const layoutBotonSalto = useRef<LayoutDeZona | null>(null);
  const layoutBotonArriba = useRef<LayoutDeZona | null>(null);
  const layoutBotonAbajo = useRef<LayoutDeZona | null>(null);
  const layoutBotonIzquierda = useRef<LayoutDeZona | null>(null);
  const layoutBotonDerecha = useRef<LayoutDeZona | null>(null);
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
    (ref: RefObject<LayoutDeZona | null>) => (evento: LayoutChangeEvent) => {
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

  const resolverTeclasActivas = (touches: NativeTouchEvent[]): Set<string> => {
    const teclasNuevas = new Set<string>();

    for (const toque of touches) {
      const { pageX, pageY } = toque;

      if (estaEnZona(pageX, pageY, layoutBotonSalto.current)) {
        teclasNuevas.add("Space");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutBotonArriba.current)) {
        teclasNuevas.add("ArrowUp");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutBotonAbajo.current)) {
        teclasNuevas.add("ArrowDown");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutBotonIzquierda.current)) {
        teclasNuevas.add("ArrowLeft");
        continue;
      }
      if (estaEnZona(pageX, pageY, layoutBotonDerecha.current)) {
        teclasNuevas.add("ArrowRight");
        continue;
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
    layoutBotonArriba,
    layoutBotonAbajo,
    layoutBotonIzquierda,
    layoutBotonDerecha,
    capturarLayoutDeZona,
    procesarToques,
  };
};

export default useControlesDeGamepad;
