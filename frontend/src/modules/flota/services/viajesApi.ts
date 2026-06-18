import { api, type ApiResponse } from "../../../shared/api/client";

export interface Viaje {
  id_viaje: number;
  codigo_reserva_patio: string;
  nombre_cliente: string;
  tipo_operacion: string;
  fecha_hora_estimada: string;
  fecha_limite_entrega: string;
  cantidad_camiones: number;
  estado_viaje: string;
}

export interface ViajeDetail extends Viaje {
  hora_recogida_inicio: string;
  hora_recogida_fin: string;
  guia_remision_ransa: string;
  nro_orden_origen: string;
  total_bultos: number;
  total_peso_kg: number;
  direccion_entrega: string;
  latitud: number;
  longitud: number;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_correo: string;
  nombre_cliente: string;
  ruc: string;
}

export interface CamionDisponible {
  id_camion: number;
  url_foto_vehiculo: string;
  placa_matricula: string;
  modelo: string;
  capacidad_toneladas: number;
  clasificacion_peso: string;
  estado_operativo: string;
  fecha_proximo_mantenimiento: string;
}

export interface CrearViajePayload {
  id_pedido: number;
  codigo_reserva_patio: string;
  tipo_operacion: string;
  fecha_hora_estimada: string;
  guia_remision_ransa: string;
  fecha_limite_entrega: string;
  hora_recogida_inicio: string;
  hora_recogida_fin: string;
}

export interface AsignacionPayload {
  id_camion: number;
  id_conductor?: number;
}

export function getViajes(params?: {
  page?: number;
  limit?: number;
  estado_viaje?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.estado_viaje)
    searchParams.set("estado_viaje", params.estado_viaje);

  const query = searchParams.toString();
  return api.get<ApiResponse<Viaje[]>>(
    `/api/flota/viajes${query ? `?${query}` : ""}`
  );
}

export function getViajeById(id: number) {
  return api.get<ApiResponse<ViajeDetail>>(`/api/flota/viajes/${id}`);
}

export function getCamionesDisponibles(fecha: string) {
  return api.get<ApiResponse<CamionDisponible[]>>(
    `/api/flota/viajes/disponibles?fecha=${fecha}`
  );
}

export function crearViaje(payload: CrearViajePayload) {
  return api.post<ApiResponse<{ id_viaje: number }>>(
    "/api/flota/viajes",
    payload
  );
}

export function asignarCamion(
  idViaje: number,
  payload: AsignacionPayload
) {
  return api.post<ApiResponse<{ id_asignacion: number }>>(
    `/api/flota/viajes/${idViaje}/asignaciones`,
    payload
  );
}
