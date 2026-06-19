import { api, type ApiResponse } from "../../../shared/api/client";

export interface KpiCabecera {
  total_vehiculos: number;
  total_autorizados: number;
  total_denegados: number;
  var_pct_vehiculos: number;
  var_pct_autorizados: number;
  var_pct_denegados: number;
}

export interface ActividadSemanal {
  fecha_snapshot: string;
  dia_semana: string;
  total_autorizados: number;
  total_denegados: number;
}

export interface MotivoDenegacion {
  tipo_motivo: string;
  total: number;
  porcentaje: number;
}

export interface UltimoEvento {
  punto_de_control: string;
  placa: string;
  empresa_cliente: string;
  fecha_hora: string;
  resultado: string;
}

export interface EstadoSistema {
  alertas_activas: number;
  uptime_pct: number;
}

export function getKpiCabecera() {
  return api.get<ApiResponse<KpiCabecera | null>>("/api/dashboard/kpi-cabecera");
}

export function getActividadSemanal() {
  return api.get<ApiResponse<ActividadSemanal[]>>("/api/dashboard/actividad-semanal");
}

export function getMotivosDenegacion() {
  return api.get<ApiResponse<MotivoDenegacion[]>>("/api/dashboard/motivos-denegacion");
}

export function getUltimosEventos() {
  return api.get<ApiResponse<UltimoEvento[]>>("/api/dashboard/ultimos-eventos");
}

export function getEstadoSistema() {
  return api.get<ApiResponse<EstadoSistema | null>>("/api/dashboard/estado-sistema");
}
