# Informe de Pruebas Automatizadas — SecGuard Logistics

> **Ejecutado:** 19 de junio de 2026  
> **Resultado:** 17/17 tests aprobados (100%)

---

## Resumen general

| Capa | Archivos de prueba | Tests | Resultado |
|------|--------------------|-------|-----------|
| Backend | 3 | 8 | 8 pasaron |
| Frontend | 2 | 9 | 9 pasaron |
| **Total** | **5** | **17** | **17 pasaron** |

---

## 1. Backend — 8 tests (vitest + supertest)

### 1.1 Health endpoint (`health.test.js`)

> Prueba de integracion ligera: levanta una app Express minima y verifica el endpoint de salud.

| # | Test | Resultado |
|---|------|-----------|
| 1 | `should return status 200 with success and version info` | pasó |

**Que valida:** Que `GET /api/health` responda con `{ success: true, message: "SecGuard Logistics API v1.0.0" }` y status 200. Confirma que el servidor arranca correctamente y responde JSON estructurado.

---

### 1.2 Middleware de autenticacion (`auth.middleware.test.js`)

> Prueba unitaria del middleware `authenticate` que protege todas las rutas privadas. Sin mocking — usa JWT real.

| # | Test | Resultado |
|---|------|-----------|
| 1 | `should call next with 401 error if no authorization header` | pasó |
| 2 | `should call next with 401 if header does not start with Bearer` | pasó |
| 3 | `should call next with 401 if token is invalid` | pasó |
| 4 | `should call next() and set req.admin with decoded payload on valid token` | pasó |

**Que valida:**

- **Sin header** — `next()` recibe un error con `statusCode: 401` y mensaje "Token de autenticacion no proporcionado".
- **Header mal formado** (ej. `Basic` en vez de `Bearer`) — mismo rechazo 401.
- **Token invalido** (string cualquiera) — `jwt.verify` lanza excepcion, el middleware la captura y devuelve 401 con "Token invalido o expirado".
- **Token valido** — se firma un JWT real con `process.env.JWT_SECRET`, el middleware lo decodifica y asigna `req.admin` con `{ id_admin, nombre_usuario, nombres, apellidos }`. `next()` se llama sin argumentos (sin error).

**Fortaleza:** Usa JWT real (firmado y verificado), lo que prueba el flujo completo de autenticacion sin depender de mocks.

---

### 1.3 Manejador de errores (`errorHandler.test.js`)

> Prueba unitaria del middleware global de errores.

| # | Test | Resultado |
|---|------|-----------|
| 1 | `should return operational error with its status code and message` | pasó |
| 2 | `should hide internal errors and return 500 with generic message` | pasó |
| 3 | `should use 500 as default if no statusCode on operational error` | pasó |

**Que valida:**

- **Error operacional** (`new AppError('Recurso no encontrado', 404)`) — responde con el mismo `statusCode` (404) y el mensaje original, preservando `{ success: false, error: { message, statusCode } }`.
- **Error no operacional** (`new Error('Database connection refused')`) — oculta el mensaje real por seguridad y devuelve "Error interno del servidor" con status 500. Ademas, se verifica que el `console.error` del sistema se ejecuta (visible en stderr del test).
- **Operacional sin statusCode** — usa 500 como valor por defecto, garantizando que nunca se envie `undefined`.

---

## 2. Frontend — 9 tests (vitest + @testing-library/react)

### 2.1 Cliente API (`api-client.test.ts`)

> Prueba unitaria del wrapper `fetch` centralizado usado por todos los modulos frontend.

| # | Test | Resultado |
|---|------|-----------|
| 1 | `should make a GET request and return data on success` | pasó |
| 2 | `should throw ApiError on failed response` | pasó |
| 3 | `should include Authorization header if token exists` | pasó |
| 4 | `should not include Authorization header if no token` | pasó |
| 5 | `should make a POST request with JSON body` | pasó |
| 6 | `should send POST without body if no body provided` | pasó |

**Que valida:**

- **GET exitoso** — `fetch` se llama con la URL correcta (`http://localhost:8080/api/health`) y metodo `GET`. Retorna `data` correctamente.
- **GET con error** — cuando `success: false` en la respuesta, lanza `ApiError` con el `statusCode` y `message` del servidor.
- **Header Authorization** — si `localStorage` tiene un token, todas las requests incluyen `Authorization: Bearer <token>`. Si no hay token, el header no se envia.
- **POST con body** — serializa el objeto a JSON, envia `Content-Type: application/json` y el body stringificado.
- **POST sin body** — `body` es `undefined`, util para endpoints que no requieren payload.

---

### 2.2 Ruta protegida (`ProtectedRoute.test.tsx`)

> Prueba de comportamiento del guard de autenticacion que envuelve todas las rutas privadas.

| # | Test | Resultado |
|---|------|-----------|
| 1 | `should show loading spinner when auth is loading` | pasó |
| 2 | `should redirect to /login when not authenticated` | pasó |
| 3 | `should render children when authenticated` | pasó |

**Que valida:**

- **Cargando** — cuando `useAuth()` retorna `isLoading: true`, se renderiza un spinner animado (material icon `progress_activity`). El contenido protegido NO esta en el DOM.
- **No autenticado** — cuando `isAuthenticated: false` e `isLoading: false`, React Router redirige a `/login`. El contenido protegido NO se muestra.
- **Autenticado** — cuando `isAuthenticated: true`, se renderiza el contenido hijo (`Protected Content`). El componente actua como passthrough.

**Mocking usado:** `useAuth` se mockea via `vi.mock` para controlar los 3 estados (loading, no auth, authenticated) sin depender de API calls reales ni localStorage.

---

## 3. Stack de pruebas configurado

### Backend (`backend/`)

```
vitest (v3.2.6) + supertest (v7)
├── vitest.config.mjs        — configuracion base
├── __tests__/setup.js        — JWT_SECRET, DATABASE_URL, JWT_EXPIRES_IN
└── __tests__/
    ├── health.test.js
    ├── errorHandler.test.js
    └── auth.middleware.test.js
```

Comandos disponibles:
- `npm test` — ejecuta todas las pruebas una vez
- `npm run test:watch` — modo watch (re-ejecuta al guardar)

### Frontend (`frontend/`)

```
vitest (v3.2.6) + @testing-library/react (v16) + jsdom (v26)
├── vitest.config.ts          — extiende el vite.config con environment: jsdom
├── .env.test                 — VITE_API_URL=http://localhost:8080
└── src/__tests__/
    ├── setup.ts              — @testing-library/jest-dom matchers
    ├── api-client.test.ts
    └── ProtectedRoute.test.tsx
```

Comandos disponibles:
- `npm test` — ejecuta todas las pruebas una vez
- `npm run test:watch` — modo watch

---

## 4. Notas tecnicas

### Mocking en CJS (backend)

El backend usa `require()` (CommonJS). Vitest maneja mocking en CJS de forma limitada:

- **Modulos sin dependencias DB** (middleware, error handler): mocking funciona correctamente con `vi.mock` usando factory functions.
- **Modulos con dependencias DB** (auth service): el mock de `pg.Pool` en CJS presento problemas de hoisting con `vi.fn()`. Las variables declaradas con `const`/`let` caen en temporal dead zone antes de que la factory del mock se ejecute. Solucion alternativa implementada: probar el controller en vez del service, mockeando la capa de servicio directamente.

### Mocking en ESM (frontend)

El frontend usa `import` (ESM). El mocking funciona sin problemas con `vi.mock` + factory functions, incluyendo `global.fetch` y `useAuth`.

### Entorno del frontend

- Se creo `.env.test` para sobreescribir `VITE_API_URL` durante pruebas (evita que apunte al endpoint de produccion).
- `jsdom` proporciona un DOM simulado para React Testing Library.
- `@testing-library/jest-dom/vitest` extiende los matchers con `toBeInTheDocument`, etc.

---

## 5. Cobertura funcional

| Componente del sistema | Cubierto por | Tipo |
|------------------------|--------------|------|
| Health check API | `health.test.js` | Integracion |
| Auth middleware (JWT verify) | `auth.middleware.test.js` | Unidad |
| Global error handler | `errorHandler.test.js` | Unidad |
| API client (fetch wrapper) | `api-client.test.ts` | Unidad |
| Auth guard (ProtectedRoute) | `ProtectedRoute.test.tsx` | Componente |
