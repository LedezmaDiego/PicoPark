export type LayoutDeZona = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type EstadoDeConexion =
  | "Desconectado"
  | "Conectando..."
  | "Conectado"
  | "Servidor apagado"
  | "Error de red";
