import { api, type ApiResponse } from "../../../shared/api/client";

export interface Camion {
  id_camion: number;
  url_foto_vehiculo: string;
  placa_matricula: string;
  modelo: string;
  tipo_unidad: string;
  clasificacion_peso: string;
  capacidad_toneladas: number;
  tipo_capacidad_display: string;
  estado_operativo: string;
  fecha_proximo_mantenimiento: string;
}

export interface CamionDetail extends Camion {
  vigencia_soat: string;
  vigencia_tarjeta_propiedad: string;
  observaciones: string;
}

export interface EventoProximo {
  tipo_evento: string;
  fecha_evento: string;
  detalle: string;
}

export interface Mantenimiento {
  id_mantenimiento: number;
  tipo_mantenimiento: string;
  fecha_mantenimiento: string;
  descripcion: string;
}

export function getCamiones(params?: {
  page?: number;
  limit?: number;
  clasificacion_peso?: string;
  estado_operativo?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.clasificacion_peso)
    searchParams.set("clasificacion_peso", params.clasificacion_peso);
  if (params?.estado_operativo)
    searchParams.set("estado_operativo", params.estado_operativo);

  const query = searchParams.toString();
  return api.get<ApiResponse<Camion[]>>(
    `/api/flota/camiones${query ? `?${query}` : ""}`
  );
}

export function getCamionById(id: number) {
  return api.get<ApiResponse<CamionDetail>>(`/api/flota/camiones/${id}`);
}

export function getEventosProximos(id: number) {
  return api.get<ApiResponse<EventoProximo[]>>(
    `/api/flota/camiones/${id}/eventos-proximos`
  );
}

export function getMantenimientos(id: number) {
  return api.get<ApiResponse<Mantenimiento[]>>(
    `/api/flota/camiones/${id}/mantenimientos`
  );
}
