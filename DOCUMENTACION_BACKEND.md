# DOCUMENTACION BACKEND — SECGUARD LOGISTICS

## Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Base de datos | PostgreSQL |
| Driver BD | pg (node-postgres) |
| Autenticacion | JWT (jsonwebtoken) |
| Hashing | bcryptjs |
| Validacion | express-validator |
| Seguridad | helmet, cors |

---

## 1. INSTRUCCIONES DE INSTALACION

```bash
cd backend
npm install
```

Configurar variables de entorno en el archivo `.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/secguard_logistics
JWT_SECRET=secguard_jwt_secret_change_in_production_2026
JWT_EXPIRES_IN=8h
```

Ejecutar el script de creacion de tablas `CREACION_TABLAS_VERSION4.SQL` y el de insercion de datos `INSERT_DATA.sql` en PostgreSQL antes de iniciar.

```bash
npm start       # produccion
npm run dev     # desarrollo (nodemon)
```

---

## 2. AUTENTICACION

Todos los endpoints excepto `/api/auth/login` y `/api/health` requieren el header:

```
Authorization: Bearer <token_jwt>
```

---

## 3. ENDPOINTS

### 3.1 HEALTH CHECK

**GET** `/api/health`

```
RESPONSE 200:
{
  "success": true,
  "message": "SecGuard Logistics API v1.0.0"
}
```

---

### 3.2 AUTH (2 endpoints)

#### Login

**POST** `/api/auth/login`

```
REQUEST:
{
  "nombre_usuario": "cvillalobos",
  "contrasenia": "password123"
}

RESPONSE 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id_admin": 1,
      "nombres": "Carlos Ernesto",
      "apellidos": "Villalobos Quispe",
      "correo_electronico": "c.villalobos@ransa.pe",
      "nombre_usuario": "cvillalobos"
    }
  }
}

ERROR 401: { "success": false, "error": { "message": "Credenciales incorrectas", "statusCode": 401 } }
ERROR 403: { "success": false, "error": { "message": "Cuenta bloqueada o inactiva...", "statusCode": 403 } }
```

#### Perfil del admin

**GET** `/api/auth/me`

```
HEADERS: Authorization: Bearer <token>

RESPONSE 200:
{
  "success": true,
  "data": {
    "id_admin": 1,
    "nombres": "Carlos Ernesto",
    "apellidos": "Villalobos Quispe",
    "correo_electronico": "c.villalobos@ransa.pe",
    "nombre_usuario": "cvillalobos",
    "estado_cuenta": "ACTIVO",
    "creado_en": "2026-06-05T12:00:00.000Z"
  }
}
```

---

### 3.3 FLOTA — CAMIONES (4 endpoints)

#### Listado paginado de camiones

**GET** `/api/flota/camiones?page=1&limit=8&clasificacion_peso=CARGA_PESADA&estado_operativo=DISPONIBLE`

Filtros opcionales via query params:
- `clasificacion_peso`: `CARGA_PESADA`, `CARGA_MEDIA`, `COMERCIAL_LIGERO`
- `estado_operativo`: `DISPONIBLE`, `EN_RUTA`, `EN_MANTENIMIENTO`, `INACTIVO`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 1,
      "url_foto_vehiculo": "/img/flota/B7Y912.jpg",
      "placa_matricula": "B7Y-912",
      "modelo": "Volvo FMX 460",
      "tipo_unidad": "TRACTO_CAMION",
      "clasificacion_peso": "CARGA_PESADA",
      "capacidad_toneladas": 32.00,
      "tipo_capacidad_display": "Carga Pesada / 32.00 T",
      "estado_operativo": "DISPONIBLE",
      "fecha_proximo_mantenimiento": "2026-08-10T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "totalRegistros": 7,
    "totalPaginas": 1
  }
}
```

#### Detalle de camion

**GET** `/api/flota/camiones/1`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "id_camion": 1,
    "url_foto_vehiculo": "/img/flota/B7Y912.jpg",
    "placa_matricula": "B7Y-912",
    "modelo": "Volvo FMX 460",
    "tipo_unidad": "TRACTO_CAMION",
    "capacidad_toneladas": 32.00,
    "tipo_capacidad_display": "Carga Pesada / 32.00 T",
    "vigencia_soat": "2027-01-15T00:00:00.000Z",
    "vigencia_tarjeta_propiedad": "2028-06-30T00:00:00.000Z",
    "estado_operativo": "DISPONIBLE",
    "fecha_proximo_mantenimiento": "2026-08-10T00:00:00.000Z",
    "observaciones": "Unidad con GPS dual activo"
  }
}
```

#### Eventos proximos 7 dias

**GET** `/api/flota/camiones/1/eventos-proximos`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    { "tipo_evento": "VIAJE", "fecha_evento": "2026-06-12T06:00:00.000Z", "detalle": "DESPACHO" },
    { "tipo_evento": "MANTENIMIENTO", "fecha_evento": "2026-06-15T00:00:00.000Z", "detalle": "PROX-MANT-1" }
  ]
}
```

#### Ultimos 3 mantenimientos

**GET** `/api/flota/camiones/1/mantenimientos`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_mantenimiento": 1,
      "tipo_mantenimiento": "PREVENTIVO",
      "fecha_mantenimiento": "2025-02-10T00:00:00.000Z",
      "descripcion": "Cambio de aceite y filtros. Revision de frenos."
    }
  ]
}
```

---

### 3.4 FLOTA — VIAJES (5 endpoints)

#### Listado paginado de viajes

**GET** `/api/flota/viajes?page=1&limit=8&estado_viaje=PENDIENTE`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_viaje": 3,
      "codigo_reserva_patio": "RSV-2025-0043",
      "nombre_cliente": "NESTLE PERU S.A.",
      "tipo_operacion": "RECEPCION",
      "fecha_hora_estimada": "2025-05-13T09:00:00.000Z",
      "fecha_limite_entrega": "2025-05-14T10:00:00.000Z",
      "cantidad_camiones": 1,
      "estado_viaje": "PENDIENTE"
    }
  ],
  "pagination": { "page": 1, "limit": 8, "totalRegistros": 12, "totalPaginas": 2 }
}
```

#### Detalle de viaje

**GET** `/api/flota/viajes/1`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "id_viaje": 1,
    "codigo_reserva_patio": "RSV-2025-0041",
    "tipo_operacion": "DESPACHO",
    "fecha_hora_estimada": "2025-05-13T06:00:00.000Z",
    "fecha_limite_entrega": "2025-05-13T14:00:00.000Z",
    "hora_recogida_inicio": "05:30:00",
    "hora_recogida_fin": "06:30:00",
    "guia_remision_ransa": "GRR-2025-00341",
    "estado_viaje": "CONFIRMADO",
    "nro_orden_origen": "OC-ALC-2025-0341",
    "total_bultos": 320,
    "total_peso_kg": 12500.00,
    "direccion_entrega": "Av. Argentina 4793, Callao",
    "latitud": -12.0519800,
    "longitud": -77.1089500,
    "contacto_nombre": "Carmen Villanueva",
    "contacto_telefono": "987 654 321",
    "contacto_correo": "c.villanueva@alicorp.com.pe",
    "nombre_cliente": "ALICORP S.A.A.",
    "ruc": "20100055237"
  }
}
```

#### Camiones disponibles para fecha

**GET** `/api/flota/viajes/disponibles?fecha=2025-05-13`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 1,
      "url_foto_vehiculo": "/img/flota/B7Y912.jpg",
      "placa_matricula": "B7Y-912",
      "modelo": "Volvo FMX 460",
      "capacidad_toneladas": 32.00,
      "clasificacion_peso": "CARGA_PESADA",
      "estado_operativo": "DISPONIBLE",
      "fecha_proximo_mantenimiento": "2026-08-10"
    }
  ]
}
```

#### Crear viaje programado

**POST** `/api/flota/viajes`

```
REQUEST:
{
  "id_pedido": 1,
  "codigo_reserva_patio": "RSV-2025-0099",
  "tipo_operacion": "DESPACHO",
  "fecha_hora_estimada": "2025-05-15T08:00:00.000Z",
  "guia_remision_ransa": "GRR-2025-00999",
  "fecha_limite_entrega": "2025-05-15T14:00:00.000Z",
  "hora_recogida_inicio": "07:30",
  "hora_recogida_fin": "09:00"
}

RESPONSE 201:
{
  "success": true,
  "data": { "id_viaje": 11 }
}
```

#### Asignar camion y conductor a viaje

**POST** `/api/flota/viajes/11/asignaciones`

```
REQUEST:
{
  "id_camion": 2,
  "id_conductor": 3
}

RESPONSE 201:
{
  "success": true,
  "data": { "id_asignacion": 13 }
}
```

---

### 3.5 FLOTA — PEDIDOS (4 endpoints)

#### Pedidos disponibles (sin viaje activo)

**GET** `/api/flota/pedidos?page=1&limit=8`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_pedido": 6,
      "nro_orden_origen": "OC-LIN-2025-0781",
      "fecha_recepcion_pedido": "2025-05-05T08:00:00.000Z",
      "nombre_cliente": "CORPORACION LINDLEY S.A.",
      "total_bultos": 260,
      "total_peso_kg": 9800.00,
      "direccion_entrega": "Av. Las Torres 555, Zarate...",
      "estado_pedido": "RECIBIDO"
    }
  ],
  "pagination": ...
}
```

#### Detalle de pedido (ficha completa)

**GET** `/api/flota/pedidos/1`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "id_pedido": 1,
    "nro_orden_origen": "OC-ALC-2025-0341",
    "fecha_recepcion_pedido": "2025-05-02T08:30:00.000Z",
    "estado_pedido": "RECIBIDO",
    "total_bultos": 320,
    "total_peso_kg": 12500.00,
    "descripcion_restricciones": "No recepcionar entre 12:00 PM y 1:00 PM...",
    "contacto_nombre": "Carmen Villanueva",
    "contacto_telefono": "987 654 321",
    "contacto_correo": "c.villanueva@alicorp.com.pe",
    "direccion_entrega": "Av. Argentina 4793, Callao",
    "latitud": -12.0519800,
    "longitud": -77.1089500,
    "nombre_cliente": "ALICORP S.A.A.",
    "sector_industrial": "CONSUMO_MASIVO"
  }
}
```

#### Mercancia del pedido

**GET** `/api/flota/pedidos/1/mercancia`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_detalle": 1,
      "descripcion_mercancia": "Productos lacteos refrigerados...",
      "tipo_carga": "REFRIGERADA",
      "cantidad_bultos": 192,
      "peso_subtotal_kg": 7750.00,
      "requiere_camion_especial": "REFRIGERADO",
      "tipo_mercancia": "PRODUCTO"
    }
  ]
}
```

#### Capacidad requerida del pedido

**GET** `/api/flota/pedidos/1/capacidad`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "total_bultos": 320,
    "total_peso_kg": 12500.00,
    "peso_refrigerada_kg": 12500.00,
    "peso_seca_kg": 0.00,
    "peso_matpel_kg": 0.00,
    "peso_general_kg": 0.00,
    "requiere_refrigerado": true,
    "requiere_matpel": false
  }
}
```

---

### 3.6 ACCESOS (6 endpoints)

#### Historial de accesos

**GET** `/api/accesos?page=1&limit=8`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_acceso": 18,
      "timestamp_evento": "2026-06-06T06:55:00.000Z",
      "placa_detectada_alpr": "M9V-341",
      "conductor": "Jaime Francisco Ugarte Elias",
      "tipo_evento": "ENTRADA",
      "estado_deteccion": "COMPLETADO",
      "decision_acceso": "AUTORIZADO",
      "tipo_anomalia": null
    }
  ],
  "pagination": ...
}
```

#### Accesos por placa

**GET** `/api/accesos/placa/C9P-671`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_acceso": 1,
      "timestamp_evento": "2026-06-05T05:45:00.000Z",
      "placa_detectada_alpr": "C9P-671",
      "tipo_registro": "ALPR",
      "conductor": "Segundo Manuel Benites Aranda",
      "tipo_evento": "SALIDA",
      "estado_deteccion": "COMPLETADO",
      "decision_acceso": "AUTORIZADO",
      "puerta_asignada": 1,
      "tipo_anomalia": "CAMION_SUCIO"
    }
  ]
}
```

#### Detalle de acceso

**GET** `/api/accesos/1`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "id_acceso": 1,
    "timestamp_evento": "2026-06-05T05:45:00.000Z",
    "tipo_evento": "SALIDA",
    "conductor": "Segundo Manuel Benites Aranda",
    "nro_brevete": "B10456789-A3B",
    "placa_detectada_alpr": "C9P-671",
    "confianza_alpr": 98.50,
    "url_foto_captura": "/img/capturas/alpr_c9p671_out.jpg",
    "estado_deteccion": "COMPLETADO",
    "latencia_ms": 120,
    "nivel_iluminacion": "NORMAL",
    "nivel_obstruccion": "NINGUNA",
    "puerta_asignada": 1,
    "muelle_dock": "2",
    "estado_barrera": "ABIERTO",
    "decision_acceso": "AUTORIZADO",
    "tipo_registro": "ALPR",
    "prioridad_envio": "ALTO"
  }
}
```

#### Auditoria — registro original

**GET** `/api/accesos/16/auditoria-original`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_auditoria": 1,
      "id_acceso_original": 4,
      "valor_original_inmutable": "DENEGADO",
      "valor_corregido_nuevo": "AUTORIZADO",
      "modificado_en": "2026-06-05T09:40:00.000Z",
      "administrador": "Maria Fernanda Salas Huanca"
    }
  ]
}
```

#### Auditoria — registro modificado

**GET** `/api/accesos/4/auditoria-corregido`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_acceso": 16,
      "placa_detectada_alpr": "B8R-056",
      ...
      "campo_modificado": "decision_acceso",
      "valor_antes": "DENEGADO",
      "valor_despues": "AUTORIZADO",
      "motivo_justificacion": "El conductor... presento certificado fisico..."
    }
  ]
}
```

---

### 3.7 REGISTRO - ACCESO - DENEGACIÓN . SISTEMA Y ADMINISTRADOR (7 endpoints)

#### Completados — Carga Pesada (Pantalla 1)

**GET** `/api/monitoreo/completados-pesados`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 1,
      "placa_detectada_alpr": "F3I-845",
      "confianza_alpr": 98.70,
      "estado_deteccion": "COMPLETADO",
      "timestamp_evento": "2026-06-06T11:15:00.000Z",
      "latencia_ms": 112,
      "nivel_iluminacion": "NORMAL",
      "nivel_obstruccion": "NINGUNA",
      "revisado_por_admin": null,
      "modelo": "Volvo FMX 460",
      "capacidad_toneladas": 32.00,
      "tipo_vehiculo": "CARGA_PESADA"
    }
  ]
}
```

#### Errores de lectura ALPR (Pantalla 2)

**GET** `/api/monitoreo/errores-lectura`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "confianza_alpr": 22.30,
      "estado_deteccion": "ERROR EN LECTURA",
      "latencia_ms": 95,
      "nivel_iluminacion": "INSUFICIENTE",
      "nivel_obstruccion": "DETECTADA",
      "revisado_por_admin": null,
      "id_anomalia": 2,
      "tipo_anomalia": "LECTURA_FALLIDA_ALPR",
      "descripcion_detallada": "La camara ALPR proceso la cadena..."
    }
  ]
}
```

#### Entradas pendientes de revision (Pantalla 3)

**GET** `/api/monitoreo/entradas-pendientes`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 12,
      "placa_detectada_alpr": "N3X-608",
      "timestamp_evento": "2026-06-06T07:15:00.000Z",
      "tipo_evento": "ENTRADA",
      "estado_deteccion": "COMPLETADO",
      "revisado_por_admin": null,
      "modelo": "Kenworth T660",
      "capacidad_toneladas": 28.00,
      "tipo_vehiculo": "CARGA_PESADA"
    }
  ]
}
```

#### Accesos por decision (Pantalla 4 — con filtros)

**GET** `/api/monitoreo/accesos-decision?decision_acceso=AUTORIZADO&tipo_evento=ENTRADA,SALIDA&estado_barrera=ABIERTO`

Query params opcionales: `decision_acceso`, `tipo_evento` (separado por comas), `estado_barrera`.

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 1,
      "placa_detectada_alpr": "F3I-845",
      "fecha_hora_registro": "2026-06-06T11:15:00.000Z",
      "tipo_evento": "SALIDA",
      "estado_registro": "AUTORIZADO",
      "estado_barrera": "ABIERTO",
      "revisado_por_admin": null,
      "modelo": "Volvo FMX 460",
      "capacidad_toneladas": 32.00,
      "tipo_vehiculo": "CARGA_PESADA"
    }
  ]
}
```

#### Salidas con barrera cerrada (Pantalla 5)

**GET** `/api/monitoreo/salidas-cerradas`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 15,
      "placa_detectada_alpr": "R5U-723",
      "timestamp_evento": "2026-06-06T10:40:00.000Z",
      "tipo_evento": "ENTRADA",
      "estado_barrera": "CERRADO",
      "revisado_por_admin": 1,
      "prioridad_envio": "ALTO",
      "modelo": "Freightliner M2 112",
      "capacidad_toneladas": 20.00,
      "tipo_vehiculo": "CARGA_MEDIA",
      "observaciones": "Revision tecnica vencimiento cercano",
      "dni": "70123456",
      "nombres": "Julio Cesar",
      "apellidos": "Guerrero Palomino",
      "empresa_transportista": "Ransa Comercial S.A.",
      "guia_remision_ransa": "GRR-2025-00348",
      "total_peso_kg": 10300.00,
      "tipo_mercancia": "PRODUCTO"
    }
  ]
}
```

#### Salidas autorizadas y revisadas (Pantalla 6)

**GET** `/api/monitoreo/salidas-autorizadas`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 6,
      "placa_detectada_alpr": "B8R-056",
      "timestamp_evento": "2026-06-05T09:35:00.000Z",
      "decision_acceso": "AUTORIZADO",
      "tipo_evento": "SALIDA",
      "estado_barrera": "ABIERTO",
      "revisado_por_admin": 2
    }
  ]
}
```

#### Entradas denegadas con anomalias (Pantalla 7)

**GET** `/api/monitoreo/entradas-denegadas`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_camion": 7,
      "placa_detectada_alpr": "E1W-789",
      "timestamp_evento": "2026-06-05T14:15:00.000Z",
      "decision_acceso": "DENEGADO",
      "tipo_evento": "ENTRADA",
      "estado_barrera": "CERRADO",
      "revisado_por_admin": 1,
      "id_anomalia": 6,
      "tipo_anomalia": "RESTRICCION_HORARIA_PROXIMA",
      "descripcion_detallada": "La unidad E1W-789 inicio..."
    }
  ]
}
```

---

### 3.8 KPI (3 endpoints)

#### Listar KPIs activos

**GET** `/api/kpi`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_kpi": 1,
      "nombre_kpi": "Nivel de Servicio (OTIF %)",
      "categoria_operativa": "Operaciones",
      "unidad_medida": "Porcentaje",
      "formula_defined": "viajes_a_tiempo / viajes_totales",
      "umbral_critico": 85.00,
      "valor_meta": 95.00,
      "umbral_alerta": 90.00,
      "estado_kpi": "ACTIVO",
      "creado_en": "2026-06-05T00:00:00.000Z"
    }
  ]
}
```

#### Listar KPIs inactivos

**GET** `/api/kpi/inactivos`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_kpi": 5,
      "nombre_kpi": "Tasa de Incidencias / Anomalias en Accesos",
      "categoria_operativa": "Seguridad",
      "unidad_medida": "Porcentaje",
      "estado_kpi": "INACTIVO",
      ...
    }
  ]
}
```

#### Detalle de KPI

**GET** `/api/kpi/1`

```
RESPONSE 200:
{
  "success": true,
  "data": { ...mismo objeto individual que en el listado }
}
```

---

### 3.9 DASHBOARD (11 endpoints) — Jose Venegas

#### KPI de cabecera — Estado del dia (Pantalla 4.2.5)

**GET** `/api/dashboard/kpi-cabecera`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "total_vehiculos": 148,
    "total_autorizados": 134,
    "total_denegados": 14,
    "var_pct_vehiculos": 12.12,
    "var_pct_autorizados": 5.51,
    "var_pct_denegados": -2.14
  }
}
```

#### Grafico de barras — Actividad ultimos 7 dias (Pantalla 4.2.5)

**GET** `/api/dashboard/actividad-semanal`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "fecha_snapshot": "2026-05-30T00:00:00.000Z",
      "dia_semana": "SAT",
      "total_autorizados": 111,
      "total_denegados": 10
    },
    {
      "fecha_snapshot": "2026-06-01T00:00:00.000Z",
      "dia_semana": "MON",
      "total_autorizados": 107,
      "total_denegados": 11
    }
  ]
}
```

#### Grafico donut — Motivos de denegacion (Pantalla 4.2.5)

**GET** `/api/dashboard/motivos-denegacion`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    { "tipo_motivo": "FALLA_CAMARA", "total": 3, "porcentaje": 33 },
    { "tipo_motivo": "GUIA_CON_FALTANTES", "total": 3, "porcentaje": 33 },
    { "tipo_motivo": "INTRUSION_SOSPECHOSA", "total": 3, "porcentaje": 33 }
  ]
}
```

#### Tabla — Ultimos eventos de acceso (Pantalla 4.2.5)

**GET** `/api/dashboard/ultimos-eventos`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "punto_de_control": "Garita Principal de Control Perimetral",
      "placa": "M9V-341",
      "empresa_cliente": "SUPERMERCADOS PERUANOS S.A.",
      "fecha_hora": "2026-06-06T06:55:00.000Z",
      "resultado": "AUTORIZADO"
    }
  ]
}
```

#### Widget — Estado del sistema (Pantalla 4.2.5)

**GET** `/api/dashboard/estado-sistema`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "alertas_activas": 12,
    "uptime_pct": 99.80
  }
}
```

#### Ultimo intento de placa no registrada (Pantalla 4.2.21)

**GET** `/api/dashboard/intento-placa/XYZ-7890`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "placa_detectada": "XYZ-7890",
    "url_foto_captura": "/img/capturas/nreg_xyz7890_03.jpg",
    "confianza_alpr": 90.60,
    "punto_de_control": "Garita Principal de Control Perimetral",
    "timestamp_evento": "2026-06-05T14:32:45.000Z",
    "decision": "DENEGADO"
  }
}
```

#### Badge — Verificacion de placa no registrada (Pantalla 4.2.21)

**GET** `/api/dashboard/verificar-placa/XYZ-7890`

```
RESPONSE 200:
{
  "success": true,
  "data": { "motivo_badge": "PLACA_NO_REGISTRADA" }
}
```

#### Historial de intentos de una placa (Pantalla 4.2.21)

**GET** `/api/dashboard/historial-intentos/XYZ-7890`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "placa_detectada": "XYZ-7890",
      "punto_de_control": "Garita Principal de Control Perimetral",
      "timestamp_intento": "2026-06-05T14:32:45.000Z",
      "confianza_alpr": 90.60,
      "decision": "DENEGADO",
      "url_foto_captura": "/img/capturas/nreg_xyz7890_03.jpg"
    },
    {
      "placa_detectada": "XYZ-7890",
      "punto_de_control": "Garita Principal de Control Perimetral",
      "timestamp_intento": "2026-05-28T09:17:03.000Z",
      "confianza_alpr": 88.70,
      "decision": "DENEGADO",
      "url_foto_captura": "/img/capturas/nreg_xyz7890_02.jpg"
    }
  ]
}
```

#### Ultima anomalia detectada (Pantalla 4.2.22)

**GET** `/api/dashboard/ultima-anomalia`

```
RESPONSE 200:
{
  "success": true,
  "data": {
    "tipo_anomalia": "SOAT_POR_VENCER",
    "descripcion_detallada": "Alerta amarilla automatizada: El camion...",
    "autorizado_preventivo": true,
    "placa": "D7K-312",
    "empresa_cliente": "INDUSTRIAS SAN MIGUEL S.A.",
    "punto_de_control": "Garita Principal de Control Perimetral",
    "timestamp_evento": "2026-06-06T10:40:00.000Z",
    "estado_barrera": "CERRADO"
  }
}
```

#### Banner — Anomalias sin revisar hoy (Pantalla 4.2.22)

**GET** `/api/dashboard/anomalias-sin-revisar`

```
RESPONSE 200:
{
  "success": true,
  "data": { "anomalias_sin_revisar": 3 }
}
```

#### Auditoria de anomalia por placa (Pantalla 4.2.22)

**GET** `/api/dashboard/auditoria-anomalia/DFT-5521`

```
RESPONSE 200:
{
  "success": true,
  "data": [
    {
      "id_auditoria": 4,
      "campo_modificado": "decision_acceso",
      "valor_original_inmutable": "DENEGADO",
      "valor_corregido_nuevo": "AUTORIZADO",
      "motivo_justificacion": "El sistema ALPR detecto datos no actualizados...",
      "modificado_en": "2026-05-22T14:20:00.000Z",
      "modificado_por": "Maria Fernanda Salas Huanca"
    }
  ]
}
```

---

## 4. ESTRUCTURA DE DIRECTORIOS

```
backend/
├── .env
├── package.json
├── server.js
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── modules/
│   ├── auth/        (auth.routes.js, auth.controller.js, auth.service.js)
│   ├── flota/       (camiones.*.js, viajes.*.js, pedidos.*.js)
│   ├── accesos/     (accesos.*.js — Nicole)
│   ├── monitoreo/   (monitoreo.*.js — Nelson)
│   ├── kpi/         (kpi.*.js — Steven)
│   └── dashboard/   (dashboard.*.js — Venegas)
└── utils/
    ├── AppError.js
    └── pagination.js
```

---

## 5. RESPUESTAS DE ERROR ESTANDAR

```
{
  "success": false,
  "error": {
    "message": "Descripcion del error",
    "statusCode": 400
  }
}
```

Codigos HTTP: 200, 201, 400, 401, 403, 404, 500.

---

## 6. DATOS DE PRUEBA (POSTMAN)

Credenciales de administradores (password hasheado en BD — usar bcrypt para generar):

| usuario | password (pre-hash) |
|---|---|
| `cvillalobos` | `password123` |
| `msalas` | `password456` |
| `jparedes` | `password789` |

Nota: Los passwords en la BD estan hasheados con valores dummy (`$2b$12$KLMxyz123abc`). Para probar login, genera un hash bcrypt real con tu password deseado y actualiza la BD.

---

*Documentacion generada el 10/06/2026 — SecGuard Logistics Backend v1.0.0*
