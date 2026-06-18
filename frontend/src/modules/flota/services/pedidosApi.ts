import { api, type ApiResponse } from "../../../shared/api/client";

export interface Pedido {
  id_pedido: number;
  nro_orden_origen: string;
  fecha_recepcion_pedido: string;
  nombre_cliente: string;
  total_bultos: number;
  total_peso_kg: number;
  direccion_entrega: string;
  estado_pedido: string;
}

export interface PedidoDetail extends Pedido {
  descripcion_restricciones: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_correo: string;
  latitud: number;
  longitud: number;
  sector_industrial: string;
}

export interface Mercancia {
  id_detalle: number;
  descripcion_mercancia: string;
  tipo_carga: string;
  cantidad_bultos: number;
  peso_subtotal_kg: number;
  requiere_camion_especial: string;
  tipo_mercancia: string;
}

export interface CapacidadPedido {
  total_bultos: number;
  total_peso_kg: number;
  peso_refrigerada_kg: number;
  peso_seca_kg: number;
  peso_matpel_kg: number;
  peso_general_kg: number;
  requiere_refrigerado: boolean;
  requiere_matpel: boolean;
}

export function getPedidos(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return api.get<ApiResponse<Pedido[]>>(
    `/api/flota/pedidos${query ? `?${query}` : ""}`
  );
}

export function getPedidoById(id: number) {
  return api.get<ApiResponse<PedidoDetail>>(`/api/flota/pedidos/${id}`);
}

export function getMercanciaPedido(id: number) {
  return api.get<ApiResponse<Mercancia[]>>(
    `/api/flota/pedidos/${id}/mercancia`
  );
}

export function getCapacidadPedido(id: number) {
  return api.get<ApiResponse<CapacidadPedido>>(
    `/api/flota/pedidos/${id}/capacidad`
  );
}
