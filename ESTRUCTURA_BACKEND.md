# ESTRUCTURA DEL BACKEND — SECGUARD LOGISTICS

## 1. Arquitectura general

El backend de SecGuard Logistics sigue una arquitectura modular por capas basada en **Express.js**, con separacion clara de responsabilidades en cada modulo funcional. La API expone **41 endpoints** protegidos con autenticacion **JWT** que alimentan las pantallas del sistema de control de acceso vehicular con ALPR para RANSA.

```
Cliente (React)  ──►  Express API  ──►  PostgreSQL
                          │
                   ┌──────┴──────┐
                   │  Middleware  │
                   │  JWT Auth    │
                   └─────────────┘
```

> **[CAPTURA: Diagrama de arquitectura general]**

---

## 2. Stack tecnologico

| Capa | Tecnologia | Justificacion |
|---|---|---|
| Runtime | Node.js 18+ | Alto rendimiento para operaciones I/O con BD |
| Framework | Express.js 4.x | Ligero, modular, ecosistema maduro |
| BD Driver | pg (node-postgres) | Conexion directa sin overhead de ORM |
| Autenticacion | JWT + bcryptjs | Tokens stateless sin sesion en servidor |
| Validacion | express-validator | Sanitizacion de entradas en endpoints POST |
| Seguridad | helmet + cors | Cabeceras HTTP seguras y control de origen |

> **[CAPTURA: package.json con dependencias]**

---

## 3. Estructura de directorios

```
backend/
├── .env                          # Variables de entorno
├── package.json                  # Dependencias y scripts
├── server.js                     # Punto de entrada y montaje de rutas
├── config/
│   └── db.js                     # Pool de conexiones PostgreSQL
├── middleware/
│   ├── auth.js                   # Verificacion de token JWT
│   ├── errorHandler.js           # Manejador centralizado de errores
│   └── validate.js               # Validacion de requests
├── utils/
│   ├── AppError.js               # Clase de error personalizada
│   └── pagination.js             # Helper de paginacion unificada
└── modules/
    ├── auth/                     # Login y perfil
    ├── flota/
    │   ├── camiones.*.js         # Gestion de flota vehicular
    │   ├── viajes.*.js           # Programacion de viajes
    │   └── pedidos.*.js          # Pedidos de clientes
    ├── accesos/                  # Registro y auditoria de accesos
    ├── monitoreo/                # Pantallas de control y deteccion
    ├── kpi/                      # Indicadores de desempeno
    └── dashboard/                # Dashboard inicial y alertas
```

> **[CAPTURA: Arbol de directorios en VS Code]**

---

## 4. Patron de diseno: 3 capas por modulo

Cada modulo funcional sigue el mismo patron **routes → controller → service**, lo que facilita el mantenimiento y la escalabilidad:

```
routes.js         →  Define endpoints y middlewares de validacion
controller.js     →  Extrae parametros del request, llama al service, envia respuesta
service.js        →  Contiene la logica de negocio y queries SQL parametrizadas
```

**Ejemplo — Modulo Auth:**

> **[CAPTURA: auth.routes.js]**

> **[CAPTURA: auth.controller.js]**

> **[CAPTURA: auth.service.js]**

---

## 5. Modulos funcionales

| Modulo | Endpoints | Pantallas que alimenta | Responsable queries |
|---|---|---|---|
| Auth | 2 | Login, perfil de administrador | — |
| Flota — Camiones | 4 | Gestion de Flota (listado, detalle, eventos, mantenimientos) | Diogo |
| Flota — Viajes | 5 | Viajes Programados, Registro de Viaje (pasos 1-4) | Diogo |
| Flota — Pedidos | 4 | Seleccion de Pedido, detalle de mercancia, capacidad | Diogo |
| Accesos | 6 | Historial de accesos, detalle, auditoria original/corregido | Nicole |
| Monitoreo | 7 | 7 pantallas de control de accesos y deteccion de anomalias | Nelson |
| KPI | 3 | Configuracion de KPIs (activos/inactivos) | Steven |
| Dashboard | 11 | Dashboard inicial (4.2.5), acceso denegado (4.2.21), presencia de anomalia (4.2.22) | Venegas |
| **Total** | **41** | | |

> **[CAPTURA: server.js con montaje de rutas]**

---

## 6. Autenticacion JWT

El flujo de autenticacion sigue el siguiente proceso:

1. El administrador envia `nombre_usuario` y `contrasenia` al endpoint `POST /api/auth/login`
2. El servicio verifica las credenciales contra PostgreSQL usando `bcrypt.compare()`
3. Si son validas, se genera un token JWT firmado con `JWT_SECRET` y se registra la sesion en `sesion_admin`
4. El frontend almacena el token y lo envia en cada request como header `Authorization: Bearer <token>`
5. El middleware `auth.js` verifica el token en cada ruta protegida

```
POST /api/auth/login  ──►  bcrypt.compare()  ──►  jwt.sign()  ──►  INSERT sesion_admin
                                                                      │
                                                ┌─────────────────────┘
                                                ▼
                              GET /api/*  ──►  auth.js middleware  ──►  jwt.verify()
```

> **[CAPTURA: middleware/auth.js]**

---

## 7. Paginacion unificada

Todos los endpoints de listado utilizan un helper comun que recibe `page` y `limit` como query params y devuelve metadata de paginacion en la respuesta:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "totalRegistros": 148,
    "totalPaginas": 19
  }
}
```

> **[CAPTURA: utils/pagination.js]**

---

## 8. Mapeo de queries SQL a la BD

Las queries originales del equipo fueron adaptadas al esquema final de base de datos (`CREACION_TABLAS_VERSION4.SQL`), que incluye 18 tablas normalizadas en 3FN con integridad referencial. Las consultas se ejecutan directamente con `pg` usando parametros parametrizados (`$1`, `$2`) para prevenir SQL injection.

**Tablas principales utilizadas:**

| Modulo BD | Tablas |
|---|---|
| Seguridad | `administrador`, `sesion_admin` |
| Clientes y flota | `cliente_empresa`, `conductor_ransa`, `camion_ransa`, `mantenimiento_camion` |
| Pedidos y distribucion | `pedido_cliente`, `detalle_pedido_mercancia`, `viaje_programado`, `viaje_camion_asignado` |
| Control de accesos | `camara_dispositivo`, `registro_acceso`, `intento_acceso_no_registrado`, `motivo_acceso`, `anomalia_acceso`, `infraccion_transito` |
| Auditoria y KPI | `auditoria_modificacion_acceso`, `configuracion_kpi`, `snapshot_kpi_diario`, `metrica_operacional_sistema` |

> **[CAPTURA: Ejemplo de query SQL en un service — p.ej. camiones.service.js]**

---

## 9. Manejo de errores

El backend utiliza una clase `AppError` personalizada que permite diferenciar errores operacionales (esperados) de errores de programacion. El middleware `errorHandler.js` captura todas las excepciones y devuelve una respuesta estandarizada:

```json
{
  "success": false,
  "error": {
    "message": "Camion no encontrado",
    "statusCode": 404
  }
}
```

Codigos HTTP utilizados: `200`, `201`, `400`, `401`, `403`, `404`, `500`.

> **[CAPTURA: utils/AppError.js + middleware/errorHandler.js]**

---

## 10. Conexion a base de datos

La conexion a PostgreSQL se gestiona mediante un pool de conexiones configurado en `config/db.js`, usando la variable de entorno `DATABASE_URL`. El pool maneja automaticamente la reutilizacion de conexiones y la reconexion ante fallos.

```
.env:
  PORT=3000
  DATABASE_URL=postgresql://usuario:password@host:5432/secguard_logistics
  JWT_SECRET=<clave_secreta>
  JWT_EXPIRES_IN=8h
```

> **[CAPTURA: config/db.js + .env]**

---

*Documento generado para el informe del proyecto — SecGuard Logistics, Junio 2026*
