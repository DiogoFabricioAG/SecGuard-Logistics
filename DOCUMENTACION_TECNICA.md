# SecGuard Logistics — Documentación Técnica

## Stack y Herramientas

| Capa | Tecnología | Host |
|------|-----------|------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 + Vite | **Vercel** |
| Backend | Node.js + Express.js | **Seenode** |
| Base de datos | PostgreSQL | **Neon DB** |
| Almacenamiento | Amazon S3 | **AWS us-east-2** |
| Streaming cámara | PeerJS (WebRTC P2P) | PeerJS Cloud |
| ALPR (detección placa) | Plate Recognizer API | plate recognizer.com |

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        VER CEL (Frontend)                        │
│  React SPA → Tailwind v4 → Vite → deploy estático               │
│                                                                  │
│  Módulos:                                                        │
│  ├─ auth/     (Login, JWT, ProtectedRoute)                      │
│  ├─ flota/    (Gestión vehículos + Viajes + Pedidos)            │
│  ├─ camara/   (Detección ALPR + PeerJS streaming + Registro)    │
│  └─ kpi/      (Analítica y reportes)                            │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTPS
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SEENODE (Backend)                             │
│  Express.js → JWT auth → PostgreSQL → S3                         │
│                                                                  │
│  Módulos:                                                        │
│  ├─ auth/        POST login, GET me                              │
│  ├─ flota/       camiones, viajes, pedidos CRUD                  │
│  ├─ accesos/     historial, detalle, modificación                │
│  ├─ monitoreo/   detecciones, errores, registro manual, upload   │
│  ├─ kpi/         métricas, reportes                              │
│  └─ dashboard/   KPIs cabecera, actividad, eventos               │
└───────┬───────────────┬──────────────────────────────────────────┘
        │               │
        ▼               ▼
┌──────────────┐  ┌──────────────┐
│   NEON DB    │  │   AWS S3     │
│  PostgreSQL  │  │ secguard-    │
│              │  │ vehicles     │
│  Tablas:     │  │              │
│  • registro_ │  │ /capturas/   │
│    acceso    │  │   {placa}-   │
│  • camion_   │  │   {ts}.jpg   │
│    ransa     │  │              │
│  • viaje_    │  │              │
│    programado│  │              │
│  • pedido_   │  │              │
│    cliente   │  │              │
│  • ...       │  │              │
└──────────────┘  └──────────────┘
```

---

## 1. Módulo Auth (Login)

### Flujo

```
Usuario ingresa credenciales
  │
  ├─ POST /api/auth/login { nombre_usuario, contrasenia }
  │     └─ Backend: bcrypt.compare → genera JWT (8h expiry)
  │     └─ Respuesta: { token, admin: { id, nombres, apellidos, ... } }
  │
  ├─ Token se guarda en localStorage
  ├─ GET /api/auth/me → valida token → retorna perfil completo
  └─ Todas las requests subsiguientes llevan Authorization: Bearer <token>
```

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Login, retorna JWT |
| GET | `/api/auth/me` | Sí | Perfil del admin autenticado |

---

## 2. Módulo Flota

### 2.1 Gestión de Vehículos (`/flota`)

**Pantalla:** `GestionFlotaPage` — tabla izquierda + panel detalle derecho.

```
GET /api/flota/camiones?page=1&limit=8&estado_operativo=DISPONIBLE&clasificacion_peso=CARGA_PESADA
  └─ Retorna: { data: Camion[], pagination: { page, limit, totalRegistros, totalPaginas } }

Click en fila →
  ├─ GET /api/flota/camiones/:id           → detalle completo (SOAT, tarjeta, observaciones)
  ├─ GET /api/flota/camiones/:id/eventos-proximos → pronóstico 7 días (VIAJE/MANTENIMIENTO)
  └─ GET /api/flota/camiones/:id/mantenimientos   → últimos 3 mantenimientos
```

**Filtros:** `estado_operativo` (DISPONIBLE/EN_RUTA/EN_MANTENIMIENTO), `clasificacion_peso` (CARGA_PESADA/CARGA_MEDIA/COMERCIAL_LIGERO).

### 2.2 Registrar Viaje (`/rutas`)

**Pantalla:** `RutasPage` — tabla de viajes + wizard slide-in con 4 pasos.

**Tabla de viajes programados:**
```
GET /api/flota/viajes?page=1&limit=8  → paginación server-side
Buscador: filtro client-side por código o cliente
```

**Wizard 4 pasos:**

| Paso | Componente | API |
|------|-----------|-----|
| 1. Datos recogida | `Step1DatosRecogida` | `GET /api/flota/pedidos/:id` + `GET /api/flota/pedidos/:id/mercancia` + mapa Leaflet |
| 2. Fecha y hora | `Step2FechaHora` | Solo estado local (se guarda en contexto) |
| 3. Selección flota | `Step3SeleccionFlota` | `GET /api/flota/pedidos/:id/capacidad` + `GET /api/flota/viajes/disponibles?fecha=` |
| 4. Confirmación | `Step4Confirmacion` | `POST /api/flota/viajes` → `POST /api/flota/viajes/:id/asignaciones` (por cada camión) |

**Asignación de conductores:** Random del 1-15, sin repetir. Si se seleccionan N camiones, se asignan N conductores distintos.

**Pedidos — cards de selección:** cada card muestra orden, cliente, carga (kg + bultos), dirección, fecha, badge de estado. Al clickear, se selecciona y auto-avanza al paso 1.

### Endpoints Flota

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/flota/camiones` | Listado paginado + filtros |
| GET | `/api/flota/camiones/:id` | Detalle camión |
| GET | `/api/flota/camiones/:id/eventos-proximos` | Pronóstico 7 días |
| GET | `/api/flota/camiones/:id/mantenimientos` | Últimos 3 mantto |
| GET | `/api/flota/viajes` | Listado paginado |
| GET | `/api/flota/viajes/:id` | Detalle viaje |
| GET | `/api/flota/viajes/disponibles` | Camiones disponibles en fecha |
| POST | `/api/flota/viajes` | Crear viaje programado |
| POST | `/api/flota/viajes/:id/asignaciones` | Asignar camión+conductor |
| GET | `/api/flota/pedidos` | Pedidos sin viaje activo |
| GET | `/api/flota/pedidos/:id` | Detalle pedido |
| GET | `/api/flota/pedidos/:id/mercancia` | Mercancía del pedido |
| GET | `/api/flota/pedidos/:id/capacidad` | Capacidad requerida |

---

## 3. Módulo Cámara (Detección ALPR)

### 3.1 Arquitectura de Streaming

```
┌─────────────┐                    ┌──────────────────┐
│  Celular    │  PeerJS WebRTC     │  PC (Subscriber) │
│ (Publisher) │ ◄────────────────► │                  │
│             │   video stream     │  Muestra cámara   │
│  Cámara     │ ◄────────────────► │  + datos + toast  │
│  trasera    │   DataConnection   │                  │
│             │   (broadcast msg)  │                  │
│  Ejecuta    │                    │                  │
│  ALPR cada  │                    │                  │
│  4 segundos │                    │                  │
└──────┬──────┘                    └──────────────────┘
       │
       │ Cada 4s:
       ├─ captureFrame() → JPEG del <video>
       ├─ Plate Recognizer API → { plate, confidence }
       │
       ├─ SI detecta placa nueva:
       │   ├─ normalizarPlaca("A1B234") → "A1B-234"
       │   ├─ GET /api/monitoreo/viaje-por-placa/A1B-234
       │   │     └─ Busca camión → viaje_camion_asignado → viaje PENDIENTE/CONFIRMADO
       │   ├─ POST /api/monitoreo/upload-captura { placa, imagen: base64 }
       │   │     └─ Backend → S3: secguard-vehicles/capturas/A1B-234-{ts}.jpg
       │   │     └─ Retorna URL pública
       │   ├─ broadcast({ plate, confidence, capturaUrl }) → vía DataConnection
       │   │     └─ Llega a TODOS los subscribers conectados
       │   └─ POST /api/monitoreo/registrar-deteccion { ..., url_foto_captura }
       │         └─ INSERT en registro_acceso
       │
       └─ SI es misma placa → omite (evita duplicados)
```

### 3.2 Peer ID Fijo

El publisher usa `secguard-garita-01` como Peer ID fijo. Los subscribers se auto-conectan a ese ID (polling cada 5s). Sin necesidad de pegar IDs manualmente.

**Modo celular (sender):** `position: fixed; inset: 0; z-index: 9999` — fullscreen, side bar oculta, video a pantalla completa, solo badge "TRANSMITIENDO" + botón "Detener" visible.

**Modo PC (subscriber):** layout completo con cámara + tarjetas de datos + toast de notificaciones.

### 3.3 Detalle de Ingreso (`/camara/accesos`)

**Pantalla:** `AccesosPage` — tabla de registros + panel lateral con detalle.

```
GET /api/monitoreo/accesos-decision?decision_acceso=AUTORIZADO&tipo_evento=ENTRADA,SALIDA&estado_barrera=ABIERTO

Filtros:
  ├─ Todos / Entrada / Salida  → modifica tipo_evento
  └─ Filtrar por Modelo         → filtro client-side
```

**Panel detalle:** muestra placa, modelo, flujo de acción (steps), y la captura S3 (`url_foto_captura`) si existe. Si no, placeholder "Sin captura".

### 3.4 Registro Manual (`/camara/registro-manual`)

**Pantalla:** `RegistroManualPage` — formulario editable + modales confirm/cancel.

```
Llega vía: ?placa=A1B-234&captura=https://s3.../A1B-234.jpg

Al cargar:
  └─ GET /api/monitoreo/viaje-por-placa/{placa} → muestra info del viaje

Al confirmar:
  └─ POST /api/monitoreo/registrar-deteccion { ..., decision_acceso: "AUTORIZADO" }
       └─ Modal verde de confirmación

Al cancelar:
  └─ Modal rojo de denegación
```

### 3.5 Falla de Identificación (`/camara/falla`)

```
GET /api/monitoreo/errores-lectura → datos de error ALPR
Botón "Reiniciar Escaneo" → vuelve a /camara
Botón "Nuevo Registro" → va a /camara/registro-manual
```

### Endpoints Monitoreo/Cámara

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/monitoreo/completados-pesados` | Detecciones completadas |
| GET | `/api/monitoreo/errores-lectura` | Fallos de lectura ALPR |
| GET | `/api/monitoreo/accesos-decision` | Registros con filtros |
| GET | `/api/monitoreo/salidas-cerradas` | Salidas con barrera cerrada |
| GET | `/api/monitoreo/entradas-denegadas` | Entradas denegadas |
| GET | `/api/monitoreo/viaje-por-placa/:placa` | Buscar viaje activo por placa |
| POST | `/api/monitoreo/registrar-deteccion` | INSERT en registro_acceso |
| POST | `/api/monitoreo/upload-captura` | Subir frame JPEG a S3 |

---

## 4. Módulo KPI / Analítica (`/analitica`)

**Pantallas:** `ConsultarMetricasPage` + `GenerarReportePage`.

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/kpi/disponibilidad-flota` | % camiones DISPONIBLE |
| GET | `/api/kpi/utilizacion-flota` | % camiones activos (DISPONIBLE + EN_RUTA) |
| GET | `/api/kpi/conversion-viajes` | % viajes CONFIRMADO/EN_TRANSITO |
| GET | `/api/kpi/prevencion-mantenimiento` | % mantenimientos PREVENTIVO vs CORRECTIVO |
| GET | `/api/kpi/desempeno-clientes` | Ranking clientes por peso/bultos |
| GET | `/api/kpi/distribucion-carga` | Distribución por tipo de carga |
| GET | `/api/kpi/resumen-periodo` | Totales del período (pedidos, viajes, peso, bultos) |
| POST | `/api/kpi/generar-reporte` | Reporte combinado (múltiples secciones) |

---

## 5. S3 — Almacenamiento de Capturas

### Configuración

| Parámetro | Valor |
|-----------|-------|
| Bucket | `secguard-vehicles` |
| Región | `us-east-2` (Ohio) |
| URL pública | `https://secguard-vehicles.s3.us-east-2.amazonaws.com` |
| SDK | `@aws-sdk/client-s3` |

### Flujo de upload

```
Frontend (publisher):
  captureFrame() → canvas.toDataURL("image/jpeg", 0.8) → base64 string
  POST /api/monitoreo/upload-captura { placa: "A1B-234", imagen: "data:image/jpeg;base64,..." }

Backend (config/s3.js):
  └─ Buffer.from(base64Data, "base64")
  └─ Key: capturas/A1B-234-2026-06-19T18-30-00.jpg
  └─ PutObjectCommand → S3
  └─ Retorna: { url: "https://secguard-vehicles.s3.us-east-2.amazonaws.com/capturas/A1B-234-....jpg" }

Frontend:
  └─ Incluye url_foto_captura en POST /api/monitoreo/registrar-deteccion
  └─ Broadcast via PeerJS: { capturaUrl } → subscribers lo ven en toast + RegistroManual
```

### Credenciales

Las credenciales AWS viven en `backend/.env`:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
AWS_BUCKET=secguard-vehicles
```

---

## 6. Base de Datos (Neon DB — PostgreSQL)

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `registro_acceso` | Registros de entrada/salida detectados por ALPR |
| `camion_ransa` | Flota de camiones (placa, modelo, capacidad, estado) |
| `viaje_programado` | Viajes planificados (código, fechas, estado) |
| `viaje_camion_asignado` | Asignación camión+conductor a viajes |
| `pedido_cliente` | Pedidos de clientes (carga, dirección, contacto) |
| `detalle_pedido_mercancia` | Mercancía por pedido |
| `conductor_ransa` | Conductores registrados |
| `administrador` | Admins del sistema |
| `anomalia_acceso` | Anomalías detectadas en accesos |
| `configuracion_kpi` | Configuración de KPIs |
| `snapshot_kpi_diario` | Snapshots diarios para dashboard |

### Query clave: buscar viaje por placa

```sql
SELECT cr.id_camion, vca.id_viaje, vp.codigo_reserva_patio, vp.estado_viaje
FROM camion_ransa cr
LEFT JOIN viaje_camion_asignado vca ON cr.id_camion = vca.id_camion
LEFT JOIN viaje_programado vp ON vca.id_viaje = vp.id_viaje
  AND vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
WHERE cr.placa_matricula = 'A1B-234'
ORDER BY vp.fecha_hora_estimada ASC
LIMIT 1
```

---

## 7. Normalización de Placa

Plate Recognizer devuelve la placa sin guión (ej: `A1B234`). El frontend la normaliza:

```ts
function normalizarPlaca(raw: string): string {
  const limpia = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (limpia.length >= 4) return limpia.slice(0, 3) + "-" + limpia.slice(3);
  return limpia;
}
// "a1b234" → "A1B-234"
```

---

## 8. Variables de Entorno

### Frontend (`.env`)

```
VITE_API_URL=http://localhost:3000          # API del backend
VITE_ALPR_TOKEN=0a812161...                # Token Plate Recognizer
```

### Backend (`.env`)

```
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=secguard_jwt_secret_change_in_production_2026
JWT_EXPIRES_IN=8h
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-2
AWS_BUCKET=secguard-vehicles
```

---

## 9. Despliegue

```bash
# Backend (Seenode)
cd backend
npm install
npm run dev   # o npm start para producción

# Frontend (Vercel)
cd frontend
npm install
npm run build   # tsc + vite build
# El output en dist/ se deploya a Vercel automáticamente al pushear a main
```

**Nota Vercel:** el `package.json` debe coincidir con `pnpm-lock.yaml`. Si hay mismatch, correr `pnpm install --no-frozen-lockfile` para regenerar el lockfile localmente antes de commitear.

---

## 10. Diseño Visual

### Sistema de diseño (Tailwind v4 `@theme`)

- **Paleta de colores**: 50+ tokens semánticos (`primary-container`, `surface-variant`, `on-surface`, `error`, `success`, `warning`)
- **Tipografía**: Inter (body) + Manrope (headlines). 7 tamaños predefinidos (`headline-lg/md/sm`, `body-lg/md`, `label-md/sm`)
- **Espaciado**: `xs=4px, sm=8px, md=16px, lg=24px, xl=32px`
- **Íconos**: Material Symbols Outlined (Google Fonts)
- **Componentes**: sidebar 220px, topbar 64px, tablas con `p-sm`, cards con `p-4`/`p-lg`

### Layouts adaptativos

| Dispositivo | Layout |
|-------------|--------|
| PC (subscriber) | Sidebar + Topbar + Contenido completo |
| Celular (sender) | Fullscreen — `position: fixed; z-index: 9999` — sin sidebar ni topbar |

---

## 11. Flujo Completo de Detección ALPR

```
1. Celular abre /camara → click "Activar Cámara" → se vuelve publisher
2. PeerJS crea peer con ID fijo "secguard-garita-01"
3. Cámara trasera se abre → video se muestra en pantalla completa
4. PC abre /camara → auto-conecta al peer fijo (polling 5s)
5. PC recibe video stream + data channel

6. Publisher (celular) cada 4s:
   a. captureFrame() → JPEG del video
   b. POST a Plate Recognizer API → { plate: "A1B234", score: 0.92 }
   c. normalizarPlaca("A1B234") → "A1B-234"
   d. GET /api/monitoreo/viaje-por-placa/A1B-234 → { id_camion, id_viaje, codigo_reserva }
   e. POST /api/monitoreo/upload-captura → S3 → URL pública
   f. broadcast({ type: "plate-detected", plate, capturaUrl, ... }) → vía DataConnection
   g. POST /api/monitoreo/registrar-deteccion { ..., url_foto_captura, id_viaje, id_camion }

7. Subscriber (PC):
   a. conn.on("data") → recibe broadcast
   b. Actualiza tarjetas de datos con la placa detectada
   c. Si viaje encontrado → toast verde
   d. Si sin viaje → toast ámbar + botón "Registrar Manual"
   e. Polling GET /api/monitoreo/completados-pesados cada 3s
```

---

*Documentación generada el 19/06/2026 — SecGuard Logistics v1.0.0*
