import { api, type ApiResponse } from "../../../shared/api/client";

export interface DeteccionCompletada {
  id_camion: number;
  placa_detectada_alpr: string;
  confianza_alpr: number;
  estado_deteccion: string;
  timestamp_evento: string;
  latencia_ms: number;
  nivel_iluminacion: string;
  nivel_obstruccion: string;
  revisado_por_admin: number | null;
  modelo: string;
  capacidad_toneladas: number;
  tipo_vehiculo: string;
}

export interface ErrorLectura {
  confianza_alpr: number;
  estado_deteccion: string;
  latencia_ms: number;
  nivel_iluminacion: string;
  nivel_obstruccion: string;
  revisado_por_admin: number | null;
  id_anomalia: number;
  tipo_anomalia: string;
  descripcion_detallada: string;
}

export interface AccesoDecision {
  id_camion: number;
  placa_detectada_alpr: string;
  fecha_hora_registro: string;
  tipo_evento: string;
  estado_registro: string;
  estado_barrera: string;
  revisado_por_admin: number | null;
  modelo: string;
  capacidad_toneladas: number;
  tipo_vehiculo: string;
}

export interface SalidaCerrada {
  id_camion: number;
  placa_detectada_alpr: string;
  timestamp_evento: string;
  tipo_evento: string;
  estado_barrera: string;
  revisado_por_admin: number | null;
  prioridad_envio: string;
  modelo: string;
  capacidad_toneladas: number;
  tipo_vehiculo: string;
  observaciones: string;
  dni: string;
  nombres: string;
  apellidos: string;
  empresa_transportista: string;
  guia_remision_ransa: string;
  total_peso_kg: number;
  tipo_mercancia: string;
}

export interface EntradaDenegada {
  id_camion: number;
  placa_detectada_alpr: string;
  timestamp_evento: string;
  decision_acceso: string;
  tipo_evento: string;
  estado_barrera: string;
  revisado_por_admin: number | null;
  id_anomalia: number;
  tipo_anomalia: string;
  descripcion_detallada: string;
}

export function getCompletadosPesados() {
  return api.get<ApiResponse<DeteccionCompletada[]>>("/api/monitoreo/completados-pesados");
}

export function getErroresLectura() {
  return api.get<ApiResponse<ErrorLectura[]>>("/api/monitoreo/errores-lectura");
}

export function getAccesosDecision(params?: {
  decision_acceso?: string;
  tipo_evento?: string;
  estado_barrera?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.decision_acceso) searchParams.set("decision_acceso", params.decision_acceso);
  if (params?.tipo_evento) searchParams.set("tipo_evento", params.tipo_evento);
  if (params?.estado_barrera) searchParams.set("estado_barrera", params.estado_barrera);
  const query = searchParams.toString();
  return api.get<ApiResponse<AccesoDecision[]>>(`/api/monitoreo/accesos-decision${query ? `?${query}` : ""}`);
}

export function getSalidasCerradas() {
  return api.get<ApiResponse<SalidaCerrada[]>>("/api/monitoreo/salidas-cerradas");
}

export function getEntradasDenegadas() {
  return api.get<ApiResponse<EntradaDenegada[]>>("/api/monitoreo/entradas-denegadas");
}

export function registrarDeteccion(payload: {
  placa_detectada_alpr: string;
  confianza_alpr: number;
  tipo_evento: string;
  decision_acceso: string;
  estado_barrera: string;
  latencia_ms: number;
  nivel_iluminacion: string;
  nivel_obstruccion: string;
  id_viaje?: number | null;
  id_camion?: number | null;
  url_foto_captura?: string | null;
}) {
  return api.post<ApiResponse<{ id_acceso: number }>>(
    "/api/monitoreo/registrar-deteccion",
    payload
  );
}

export function buscarViajePorPlaca(placa: string) {
  return api.get<ApiResponse<{ id_camion: number | null; id_viaje: number | null; codigo_reserva: string | null }>>(
    `/api/monitoreo/viaje-por-placa/${placa}`
  );
}

export function uploadCaptura(placa: string, imagen: string) {
  return api.post<ApiResponse<{ url: string }>>("/api/monitoreo/upload-captura", { placa, imagen });
}
