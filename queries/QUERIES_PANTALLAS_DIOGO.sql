-- Descripcion Query: Listado paginado de camiones de la flota Ransa con
--   datos de card: foto, placa, modelo, tipo+capacidad, estado y fecha
--   de próximo mantenimiento.
-- Pantalla referente: Gestión de Flota — Listado de Vehículos

SELECT
    id_camion,
    url_foto_vehiculo,
    placa_matricula,
    modelo,
    tipo_unidad,
    clasificacion_peso,
    capacidad_toneladas,
    CONCAT(
        CASE clasificacion_peso
            WHEN 'CARGA_PESADA'     THEN 'Carga Pesada'
            WHEN 'CARGA_MEDIA'      THEN 'Carga Media'
            WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
            ELSE                         'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
    )                              AS tipo_capacidad_display,
    estado_operativo,
    fecha_proximo_mantenimiento
FROM camion_ransa
ORDER BY id_camion ASC
LIMIT  8     
OFFSET 0;



-- Descripcion Query: Listado paginado de camiones con filtro por
--   clasificación de peso del vehículo. Ejemplo: Carga Pesada.
-- Pantalla referente: Gestión de Flota — Filtro «Tipo de Vehículo»

SELECT
    id_camion, url_foto_vehiculo, placa_matricula, modelo,
    tipo_unidad, clasificacion_peso, capacidad_toneladas,
    CONCAT(
        CASE clasificacion_peso
            WHEN 'CARGA_PESADA'     THEN 'Carga Pesada'
            WHEN 'CARGA_MEDIA'      THEN 'Carga Media'
            WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
            ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
    ) AS tipo_capacidad_display,
    estado_operativo,
    fecha_proximo_mantenimiento
FROM camion_ransa
WHERE clasificacion_peso = 'CARGA_PESADA'  -- 'CARGA_PESADA' | 'CARGA_MEDIA' | 'COMERCIAL_LIGERO'
ORDER BY id_camion ASC
LIMIT 8 OFFSET 0;  -- página 1



-- Descripcion Query: Listado paginado de camiones con filtro por
--   estado operativo del vehículo. Ejemplo: DISPONIBLE.
-- Pantalla referente: Gestión de Flota — Filtro «Estado del Vehículo»

SELECT
    id_camion, url_foto_vehiculo, placa_matricula, modelo,
    tipo_unidad, clasificacion_peso, capacidad_toneladas,
    CONCAT(
        CASE clasificacion_peso
            WHEN 'CARGA_PESADA'     THEN 'Carga Pesada'
            WHEN 'CARGA_MEDIA'      THEN 'Carga Media'
            WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
            ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
    ) AS tipo_capacidad_display,
    estado_operativo,
    fecha_proximo_mantenimiento
FROM camion_ransa
WHERE estado_operativo = 'DISPONIBLE'  -- 'DISPONIBLE' | 'EN_RUTA' | 'EN_MANTENIMIENTO' | 'INACTIVO'
ORDER BY id_camion ASC
LIMIT 8 OFFSET 0;  -- página 1




-- Descripcion Query: Listado paginado con ambos filtros combinados:
--   clasificación de peso y estado operativo. Incluye total de registros
--   filtrados para el paginador. Ejemplo: Carga Pesada + DISPONIBLE.
-- Pantalla referente: Gestión de Flota — Filtros combinados

SELECT
    id_camion, url_foto_vehiculo, placa_matricula, modelo,
    tipo_unidad, clasificacion_peso, capacidad_toneladas,
    CONCAT(
        CASE clasificacion_peso
            WHEN 'CARGA_PESADA'     THEN 'Carga Pesada'
            WHEN 'CARGA_MEDIA'      THEN 'Carga Media'
            WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
            ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
    ) AS tipo_capacidad_display,
    estado_operativo,
    fecha_proximo_mantenimiento
    COUNT(*) OVER() AS total_registros
FROM camion_ransa
WHERE clasificacion_peso = 'CARGA_PESADA'  -- 'CARGA_PESADA' | 'CARGA_MEDIA' | 'COMERCIAL_LIGERO'
  AND estado_operativo   = 'DISPONIBLE'    -- 'DISPONIBLE' | 'EN_RUTA' | 'EN_MANTENIMIENTO' | 'INACTIVO'
ORDER BY id_camion ASC
LIMIT 8 OFFSET 0;  -- página 1




-- Descripcion Query: Especificaciones técnicas completas de un camión:
--   foto, placa, modelo, tipo de unidad, capacidad, clasificación,
--   vigencia de SOAT y tarjeta de propiedad.
-- Pantalla referente: Gestión de Flota — Detalle de Vehículo

SELECT
    id_camion,
    url_foto_vehiculo,
    placa_matricula,
    modelo,
    tipo_unidad,
    capacidad_toneladas,
    CONCAT(
        CASE clasificacion_peso
            WHEN 'CARGA_PESADA'     THEN 'Carga Pesada'
            WHEN 'CARGA_MEDIA'      THEN 'Carga Media'
            WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
            ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
    )                           AS tipo_capacidad_display,
    vigencia_soat,
    vigencia_tarjeta_propiedad,
    estado_operativo,
    fecha_proximo_mantenimiento
FROM camion_ransa
WHERE id_camion = 1;

-- Descripcion Query: Eventos programados del camión en los próximos
--   7 días: viajes pendientes/confirmados y mantenimientos próximos.
--   Se unifican en un solo resultado con tipo_evento, fecha y detalle.
-- Pantalla referente: Gestión de Flota — Detalle de Vehículo (sección «Próximos 7 días»)

SELECT
    'VIAJE'                          AS tipo_evento,
    vp.fecha_hora_estimada           AS fecha_evento,
    vp.tipo_operacion                AS detalle
FROM viaje_camion_asignado vca
JOIN viaje_programado vp ON vp.id_viaje = vca.id_viaje
WHERE vca.id_camion = 3
  AND vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
  AND vp.fecha_hora_estimada BETWEEN CURRENT_TIMESTAMP
                                 AND CURRENT_TIMESTAMP + INTERVAL '7 days'

UNION ALL

SELECT
    'MANTENIMIENTO'                  AS tipo_evento,
    fecha_proximo_mantenimiento::TIMESTAMP AS fecha_evento,
    'PROX-MANT-' || id_camion::TEXT  AS referencia
FROM camion_ransa
WHERE id_camion = 3
  AND fecha_proximo_mantenimiento BETWEEN CURRENT_DATE
                                      AND CURRENT_DATE + INTERVAL '7 days'

ORDER BY fecha_evento ASC;


-- Descripcion Query: Últimos 3 registros de mantenimiento del camión
--   ordenados del más reciente al más antiguo.
-- Pantalla referente: Gestión de Flota — Detalle de Vehículo (sección «Historial de Mantenimiento»)

SELECT
    id_mantenimiento,
    tipo_mantenimiento,    -- PREVENTIVO | CORRECTIVO
    fecha_mantenimiento,
    descripcion
FROM mantenimiento_camion
WHERE id_camion = 1
ORDER BY fecha_mantenimiento DESC
LIMIT 3;


-- Descripcion Query: Listado paginado de viajes programados con código
--   de reserva, nombre del cliente, fecha y hora estimada, cantidad de
--   camiones asignados y estado. 8 registros por página.
-- Pantalla referente: Viajes Programados — Listado

SELECT
    vp.id_viaje,
    vp.codigo_reserva_patio,
    ce.razon_social                     AS nombre_cliente,
    vp.tipo_operacion,
    vp.fecha_hora_estimada,
    vp.fecha_limite_entrega,
    COUNT(vca.id_camion)                AS cantidad_camiones,
    vp.estado_viaje
FROM viaje_programado vp
JOIN pedido_cliente  pc  ON pc.id_pedido  = vp.id_pedido
JOIN cliente_empresa ce  ON ce.id_cliente = pc.id_cliente
LEFT JOIN viaje_camion_asignado vca ON vca.id_viaje = vp.id_viaje
GROUP BY
    vp.id_viaje, vp.codigo_reserva_patio,
    ce.razon_social, vp.tipo_operacion,
    vp.fecha_hora_estimada, vp.fecha_limite_entrega,
    vp.estado_viaje
ORDER BY vp.fecha_hora_estimada ASC
LIMIT 8 OFFSET 0;  -- página 1

-- Descripcion Query: Listado paginado de viajes filtrado por estado.
--   Incluye total de registros filtrados para el paginador.
--   Ejemplo: estado PENDIENTE.
-- Pantalla referente: Viajes Programados — Filtro «Estado»

SELECT
    vp.id_viaje,
    vp.codigo_reserva_patio,
    ce.razon_social                     AS nombre_cliente,
    vp.tipo_operacion,
    vp.fecha_hora_estimada,
    vp.fecha_limite_entrega,
    COUNT(vca.id_camion)                AS cantidad_camiones,
    vp.estado_viaje,
    COUNT(*) OVER()                     AS total_registros
FROM viaje_programado vp
JOIN pedido_cliente  pc  ON pc.id_pedido  = vp.id_pedido
JOIN cliente_empresa ce  ON ce.id_cliente = pc.id_cliente
LEFT JOIN viaje_camion_asignado vca ON vca.id_viaje = vp.id_viaje
WHERE vp.estado_viaje = 'PENDIENTE'  -- 'PENDIENTE' | 'CONFIRMADO' | 'EN_TRANSITO'
GROUP BY
    vp.id_viaje, vp.codigo_reserva_patio,
    ce.razon_social, vp.tipo_operacion,
    vp.fecha_hora_estimada, vp.fecha_limite_entrega,
    vp.estado_viaje
ORDER BY vp.fecha_hora_estimada ASC
LIMIT 8 OFFSET 0;  -- página 1





-- Descripcion Query: Datos completos del pedido seleccionado para el
--   Paso 1: dirección de recogida, contacto, restricciones y coordenadas
--   para renderizar el pin en Leaflet.
-- Pantalla referente: Registro de Viaje — Paso 1 «Selección de Pedido»
--                     (panel izquierdo: ficha del pedido)

SELECT
    pc.id_pedido,
    pc.nro_orden_origen,
    pc.fecha_recepcion_pedido,
    pc.estado_pedido,
    pc.total_bultos,
    pc.total_peso_kg,
    pc.descripcion_restricciones,
    pc.contacto_nombre,
    pc.contacto_telefono,
    pc.contacto_correo,
    pc.direccion_entrega,
    pc.latitud,
    pc.longitud,               -- → L.marker([latitud, longitud])
    ce.razon_social            AS nombre_cliente,
    ce.sector_industrial
FROM pedido_cliente  pc
JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
WHERE pc.id_pedido = 1;



-- Descripcion Query: Líneas de detalle de mercancía del pedido
--   seleccionado: descripción, tipo de carga, bultos y peso.
-- Pantalla referente: Registro de Viaje — Paso 1
--                     (tabla «Mercancía a recoger»)

SELECT
    id_detalle,
    descripcion_mercancia,
    tipo_carga,               -- REFRIGERADA | SECA | MATPEL | GENERAL
    cantidad_bultos,
    peso_subtotal_kg,
    requiere_camion_especial
FROM detalle_pedido_mercancia
WHERE id_pedido = 1
ORDER BY id_detalle ASC;


-- Descripcion Query: Pedidos en estado RECIBIDO o EN_PROCESO que
--   aún no tienen un viaje activo asignado. Se usa para el buscador
--   del Paso 1 donde el admin selecciona el pedido a despachar.
-- Pantalla referente: Registro de Viaje — Paso 1
--                     (buscador / lista de pedidos disponibles)

SELECT
    pc.id_pedido,
    pc.nro_orden_origen,
    pc.fecha_recepcion_pedido,
    ce.razon_social            AS nombre_cliente,
    pc.total_bultos,
    pc.total_peso_kg,
    pc.direccion_entrega,
    pc.estado_pedido
FROM pedido_cliente  pc
JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
WHERE pc.estado_pedido IN ('RECIBIDO', 'EN_PROCESO')
  AND pc.id_pedido NOT IN (
      SELECT vp.id_pedido
      FROM viaje_programado vp
      WHERE vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO', 'EN_TRANSITO')
  )
ORDER BY pc.fecha_recepcion_pedido ASC
LIMIT 8 OFFSET 0;  -- página 1




-- Descripcion Query: Resumen de capacidad requerida por el pedido:
--   peso total, bultos y desglose por tipo de carga (REFRIGERADA,
--   SECA, MATPEL, GENERAL) con flags de si requiere unidad especial.
-- Pantalla referente: Registro de Viaje — Paso 3 «Selección de Flota»
--                     (panel «Capacidad requerida»)

SELECT
    pc.total_bultos,
    pc.total_peso_kg,
    SUM(CASE WHEN dm.tipo_carga = 'REFRIGERADA' THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_refrigerada_kg,
    SUM(CASE WHEN dm.tipo_carga = 'SECA'        THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_seca_kg,
    SUM(CASE WHEN dm.tipo_carga = 'MATPEL'      THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_matpel_kg,
    SUM(CASE WHEN dm.tipo_carga = 'GENERAL'     THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_general_kg,
    BOOL_OR(dm.requiere_camion_especial = 'REFRIGERADO') AS requiere_refrigerado,
    BOOL_OR(dm.requiere_camion_especial = 'MATPEL')      AS requiere_matpel
FROM pedido_cliente pc
JOIN detalle_pedido_mercancia dm ON dm.id_pedido = pc.id_pedido
WHERE pc.id_pedido = 1
GROUP BY pc.total_bultos, pc.total_peso_kg;


-- Descripcion Query: Camiones en estado DISPONIBLE que no tienen
--   mantenimiento programado ni viaje activo en la fecha indicada
--   en el Paso 2. Ordenados de mayor a menor capacidad.
-- Pantalla referente: Registro de Viaje — Paso 3 (listado de unidades)

SELECT
    cr.id_camion, cr.url_foto_vehiculo, cr.placa_matricula,
    cr.modelo, cr.tipo_unidad, cr.clasificacion_peso,
    cr.capacidad_toneladas,
    cr.estado_operativo, cr.fecha_proximo_mantenimiento
FROM camion_ransa cr
WHERE cr.estado_operativo = 'DISPONIBLE'
  AND cr.fecha_proximo_mantenimiento != '2025-05-15'   -- ← fecha del Paso 2
  AND cr.id_camion NOT IN (
      SELECT vca.id_camion
      FROM viaje_camion_asignado vca
      JOIN viaje_programado      vp ON vp.id_viaje = vca.id_viaje
      WHERE vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
        AND vp.fecha_hora_estimada::DATE = '2025-05-15' -- ← misma fecha
  )
ORDER BY cr.capacidad_toneladas DESC
LIMIT 8 OFFSET 0;


-- Descripcion Query: INSERT del viaje programado con todos los datos
--   recopilados en los pasos anteriores. Retorna el id_viaje generado.
-- Pantalla referente: Registro de Viaje — Paso 4 «Resumen y Confirmación»

INSERT INTO viaje_programado (
    id_pedido, codigo_reserva_patio, tipo_operacion,
    fecha_hora_estimada, guia_remision_ransa, estado_viaje,
    programado_por_admin, fecha_limite_entrega,
    hora_recogida_inicio, hora_recogida_fin
)
VALUES (
    1,                        -- Paso 1: id_pedido
    'RP-2025-0089',           -- generado por sistema
    'DESPACHO',               -- DESPACHO | RECEPCION
    '2025-05-15 08:00:00',    -- Paso 2: fecha y hora estimada
    'GR-RANSA-2025-0412',     -- generado por sistema
    'PENDIENTE',              -- estado inicial siempre PENDIENTE
    3,                        -- id_admin de la sesión activa
    '2025-05-15 14:00:00',    -- Paso 2: fecha límite
    '07:30',                  -- Paso 2: inicio ventana recogida
    '09:00'                   -- Paso 2: fin ventana recogida
)
RETURNING id_viaje;


-- Una fila por cada camión seleccionado en el Paso 3

INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor)
VALUES
    (currval('viaje_programado_id_viaje_seq'), 2, 1),
    (currval('viaje_programado_id_viaje_seq'), 5, 3);