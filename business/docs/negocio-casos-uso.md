# Casos de Uso de Negocio (As-Is)

## 1. Control de Acceso Vehicular (As-Is)

Este proceso representa la interacción física en la garita.

- **Carriles**: Conductor, Vigilante de Garita
- **Evento de inicio**: El camión llega a la línea de parada en la entrada.

### Actividades

1. **Vigilante**: Solicita documentos de identidad y guía de remisión al conductor.
2. **Vigilante**: Camina hacia la parte frontal y posterior del camión para leer la placa.
3. **Vigilante**: Anota manualmente los datos en el cuaderno de bitácora (placa, nombre, empresa, hora de entrada).
4. **Vigilante**: Acciona manualmente la palanca o botón de la barrera física.

- **Evento de fin**: El camión avanza hacia la zona de muelles de carga.

---

## 2. Gestión y Validación de Datos de Unidades (As-Is)

Es el proceso de verificación de autorizaciones, actualmente basado en listas físicas.

- **Carriles**: Vigilante de Garita, Supervisor de Operaciones
- **Evento de inicio**: Recepción de los datos del vehículo en la garita.

### Actividades

1. **Vigilante**: Busca la placa en una lista impresa de "Unidades Autorizadas" o "Proveedores del Día" (lista enviada previamente por correo).
2. **Decisión**: ¿La placa está en la lista?
3. **Si no**: El vigilante llama por radio o teléfono al Supervisor para pedir autorización excepcional.
4. **Si sí**: Se procede con el ingreso.
5. **Vigilante**: Marca con un check en la hoja impresa que la unidad ya ingresó.

- **Evento de fin**: Confirmación de validez de la unidad para el ingreso o salida.

---

## 3. Trazabilidad de Activos en Campo (As-Is)

Se refiere al seguimiento del camión mientras está dentro de las instalaciones de RANSA.

- **Carriles**: Personal de Patio/Muelle, Seguridad, Administrador de Flota
- **Evento de inicio**: El vehículo ingresa al área de operaciones.

### Actividades

1. **Personal de Muelle**: Reporta vía radio cuando un camión específico (identificado visualmente por su placa) termina de cargar.
2. **Vigilante**: Registra en una hoja aparte el tiempo de permanencia si el camión sale de la zona de carga.
3. **Administrador**: Recolecta al final del día las hojas de registro de garita y de muelle para intentar reconstruir el tiempo de ciclo del vehículo.

- **Evento de fin**: Consolidación de datos históricos (con alto riesgo de error o pérdida).

---

## 4. Monitoreo y Supervisión de Seguridad Perimetral (As-Is)

Es la vigilancia de las fronteras operativas del centro de distribución.

- **Carriles**: Operador de Centro de Control de Seguridad (CCTV), Vigilante de Ronda
- **Evento de inicio**: Inicio del turno de vigilancia.

### Actividades

1. **Operador CCTV**: Observa monitores con cámaras analógicas que no identifican placas automáticamente; solo detectan movimiento.
2. **Vigilante de Ronda**: Realiza recorridos físicos por el perímetro para verificar que no haya vehículos estacionados en zonas prohibidas.
3. **Operador CCTV**: Si detecta una irregularidad, busca manualmente en las grabaciones de video (sin búsqueda por texto o placa).

- **Evento de fin**: Reporte de incidencias del turno redactado en un informe físico.
