import { api } from "../../../shared/api/client";

export interface Admin {
  id_admin: number;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
}

export interface AdminProfile extends Admin {
  estado_cuenta: string;
  creado_en: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: Admin;
  };
}

export interface MeResponse {
  success: boolean;
  data: AdminProfile;
}

export function login(nombre_usuario: string, contrasenia: string) {
  return api.post<LoginResponse>("/api/auth/login", {
    nombre_usuario,
    contrasenia,
  });
}

export function getMe() {
  return api.get<MeResponse>("/api/auth/me");
}
