import { api, type ApiResponse } from "../../../shared/api/client";

export interface FlotaKpi {
  total: number;
  disponibles?: number;
  activos?: number;
  porcentaje: number;
}

export interface ConversionKpi {
  total: number;
  activos: number;
  porcentaje: number;
}

export interface PrevencionKpi {
  total: number;
  preventivos: number;
  correctivos: number;
  porcentaje: number;
}

export interface ClienteRow {
  cliente: string;
  pedidos: number;
  peso_total: number;
  bultos_totales: number;
  estado_principal: string;
  color_badge: string;
}

export interface CargaRow {
  tipo_carga: string;
  total: number;
  porcentaje: number;
}

export interface ResumenPeriodo {
  total_pedidos: number;
  total_viajes: number;
  peso_total: number;
  bultos_totales: number;
}

export interface ReporteData {
  disponibilidad?: FlotaKpi;
  utilizacion?: FlotaKpi;
  conversion?: ConversionKpi;
  prevencion?: PrevencionKpi;
  clientes?: ClienteRow[];
  carga?: CargaRow[];
  resumen?: ResumenPeriodo;
}

export function getDisponibilidadFlota(tipo_unidad?: string) {
  const params = tipo_unidad ? `?tipo_unidad=${encodeURIComponent(tipo_unidad)}` : "";
  return api.get<ApiResponse<FlotaKpi>>(`/api/kpi/disponibilidad-flota${params}`);
}

export function getUtilizacionFlota(tipo_unidad?: string) {
  const params = tipo_unidad ? `?tipo_unidad=${encodeURIComponent(tipo_unidad)}` : "";
  return api.get<ApiResponse<FlotaKpi>>(`/api/kpi/utilizacion-flota${params}`);
}

export function getConversionViajes(fecha_inicio?: string, fecha_fin?: string, tipo_unidad?: string) {
  const p = new URLSearchParams();
  if (fecha_inicio) p.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) p.set("fecha_fin", fecha_fin);
  if (tipo_unidad) p.set("tipo_unidad", tipo_unidad);
  const qs = p.toString();
  return api.get<ApiResponse<ConversionKpi>>(`/api/kpi/conversion-viajes${qs ? `?${qs}` : ""}`);
}

export function getPrevencionMantenimiento(fecha_inicio?: string, fecha_fin?: string, tipo_unidad?: string) {
  const p = new URLSearchParams();
  if (fecha_inicio) p.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) p.set("fecha_fin", fecha_fin);
  if (tipo_unidad) p.set("tipo_unidad", tipo_unidad);
  const qs = p.toString();
  return api.get<ApiResponse<PrevencionKpi>>(`/api/kpi/prevencion-mantenimiento${qs ? `?${qs}` : ""}`);
}

export function getDesempenoClientes(fecha_inicio?: string, fecha_fin?: string, zona?: string) {
  const p = new URLSearchParams();
  if (fecha_inicio) p.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) p.set("fecha_fin", fecha_fin);
  if (zona) p.set("zona", zona);
  const qs = p.toString();
  return api.get<ApiResponse<ClienteRow[]>>(`/api/kpi/desempeno-clientes${qs ? `?${qs}` : ""}`);
}

export function getDistribucionCarga(fecha_inicio?: string, fecha_fin?: string) {
  const p = new URLSearchParams();
  if (fecha_inicio) p.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) p.set("fecha_fin", fecha_fin);
  const qs = p.toString();
  return api.get<ApiResponse<CargaRow[]>>(`/api/kpi/distribucion-carga${qs ? `?${qs}` : ""}`);
}

export function getResumenPeriodo(fecha_inicio?: string, fecha_fin?: string, zona?: string) {
  const p = new URLSearchParams();
  if (fecha_inicio) p.set("fecha_inicio", fecha_inicio);
  if (fecha_fin) p.set("fecha_fin", fecha_fin);
  if (zona) p.set("zona", zona);
  const qs = p.toString();
  return api.get<ApiResponse<ResumenPeriodo>>(`/api/kpi/resumen-periodo${qs ? `?${qs}` : ""}`).then(r => ({
    ...r,
    data: { ...r.data, peso_total: Number(r.data.peso_total), bultos_totales: Number(r.data.bultos_totales) },
  }));
}

export function generarReporte(body: {
  secciones: string[];
  fecha_inicio?: string;
  fecha_fin?: string;
  zona?: string;
  tipo_unidad?: string;
}) {
  return api.post<ApiResponse<ReporteData>>("/api/kpi/generar-reporte", body);
}
