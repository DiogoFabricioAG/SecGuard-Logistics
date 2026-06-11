
-- PANTALLA 4.2.5 — DASHBOARD INICIAL

-- KPIs de cabecera — Estado del día
-- Consulta la tabla snapshot_kpi_diario filtrando por la fecha actual para obtener el total de vehículos, accesos autorizados, accesos denegados y sus variaciones porcentuales respecto al día anterior. Alimenta los tres indicadores principales del encabezado del dashboard.
-- En la presentación (HACER SU NUEVO INSERT ANTES)

SELECT
    total_vehiculos,
    total_autorizados,
    total_denegados,
    var_pct_vehiculos,
    var_pct_autorizados,
    var_pct_denegados
FROM snapshot_kpi_diario
WHERE fecha_snapshot = CURRENT_DATE;

-- Gráfico de barras — Actividad de accesos últimos 7 días
-- Recupera los totales diarios de accesos autorizados y denegados de los últimos seis días desde snapshot_kpi_diario, ordenados cronológicamente. Cada fila representa una barra del gráfico de actividad semanal.
-- En la presentación (HACER SU NUEVO INSERT ANTES)

SELECT
    fecha_snapshot,
    TO_CHAR(fecha_snapshot, 'DY') AS dia_semana,
    total_autorizados,
    total_denegados
FROM snapshot_kpi_diario
WHERE fecha_snapshot >= CURRENT_DATE - INTERVAL '6 days'
ORDER BY fecha_snapshot ASC;

-- Gráfico donut — Motivos de denegación
-- Agrupa los eventos de denegación de la semana por tipo de motivo cruzando motivo_acceso con registro_acceso, calculando el porcentaje de participación de cada categoría mediante una función de ventana. Produce los tres segmentos del gráfico circular.

SELECT
    m.tipo_motivo,
    COUNT(*) AS total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 0) AS porcentaje
FROM motivo_acceso m
JOIN registro_acceso r ON r.id_acceso = m.id_acceso
WHERE DATE(r.timestamp_evento) >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY m.tipo_motivo
ORDER BY total DESC;

-- Tabla — Últimos eventos de acceso
-- Obtiene los diez eventos más recientes mediante JOINs desde registro_acceso hacia camara_dispositivo, viaje_programado, pedido_cliente y cliente_empresa, consolidando en una sola fila el punto de control, la placa, la empresa, la fecha y el resultado de cada evento.

SELECT
    cd.ubicacion_garita      AS punto_de_control,
    r.placa_detectada_alpr   AS placa,
    ce.razon_social          AS empresa_cliente,
    r.timestamp_evento       AS fecha_hora,
    r.decision_acceso        AS resultado
FROM registro_acceso r
JOIN camara_dispositivo cd ON cd.id_camara  = r.id_camara
JOIN viaje_programado   vp ON vp.id_viaje   = r.id_viaje
JOIN pedido_cliente     pc ON pc.id_pedido  = vp.id_pedido
JOIN cliente_empresa    ce ON ce.id_cliente = pc.id_cliente
ORDER BY r.timestamp_evento DESC
LIMIT 10;

-- Widget — Estado del sistema
-- Recupera el registro más reciente de metrica_operacional_sistema para obtener el porcentaje de uptime y el conteo de alertas activas, que se muestran en los tres widgets del pie del dashboard.

SELECT
    alertas_activas,
    uptime_pct
FROM metrica_operacional_sistema
ORDER BY fecha_hora DESC
LIMIT 1;


-- PANTALLA 4.2.21 — ACCESO VEHICULAR DENEGADO

-- Panel derecho — Datos del evento denegado
-- Consulta el último intento de acceso de una placa no registrada en intento_acceso_no_registrado, cruzado con camara_dispositivo para obtener el punto de control. Devuelve la foto capturada, la confianza del ALPR, el timestamp y la decisión del sistema.

SELECT
    i.placa_detectada,
    i.url_foto_captura,
    i.confianza_alpr,
    cd.ubicacion_garita   AS punto_de_control,
    i.timestamp_intento   AS timestamp_evento,
    i.decision
FROM intento_acceso_no_registrado i
JOIN camara_dispositivo cd ON cd.id_camara = i.id_camara
WHERE i.placa_detectada = 'XYZ-7890'
ORDER BY i.timestamp_intento DESC
LIMIT 1;

-- Badge — Verificación de placa no registrada
-- Realiza una consulta de existencia sobre camion_ransa buscando la placa detectada por el ALPR. Si el resultado es cero registros, el sistema determina que debe renderizar el badge de 'Placa no registrada' en la interfaz.

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 'PLACA_NO_REGISTRADA'
    END AS motivo_badge
FROM camion_ransa
WHERE placa_matricula = 'XYZ-7890';

-- Botón — Ver historial de esta placa
-- Recupera todos los registros históricos de intento_acceso_no_registrado asociados a una placa específica, ordenados del más reciente al más antiguo. Permite visualizar la cantidad de veces que ese vehículo no registrado intentó ingresar y en qué puntos de control.

SELECT
    i.placa_detectada,
    cd.ubicacion_garita   AS punto_de_control,
    i.timestamp_intento,
    i.confianza_alpr,
    i.decision,
    i.url_foto_captura
FROM intento_acceso_no_registrado i
JOIN camara_dispositivo cd ON cd.id_camara = i.id_camara
WHERE i.placa_detectada = 'XYZ-7890'
ORDER BY i.timestamp_intento DESC;


-- PANTALLA 4.2.22 — PRESENCIA DE ANOMALÍA EN EL SISTEMA

-- Panel lateral — Datos de la anomalía detectada
-- Cruza anomalia_acceso con registro_acceso y camara_dispositivo para recuperar el tipo de anomalía, descripción, si fue autorizado preventivamente, el punto de control, el timestamp y el estado de la barrera del evento más reciente.

SELECT
    a.tipo_anomalia,
    a.descripcion_detallada,
    a.autorizado_preventivo,
    r.placa_detectada_alpr      AS placa,
    ce.razon_social             AS empresa_cliente,
    cd.ubicacion_garita         AS punto_de_control,
    r.timestamp_evento,
    r.estado_barrera
FROM anomalia_acceso a
JOIN  registro_acceso    r  ON r.id_acceso   = a.id_acceso
JOIN  camara_dispositivo cd ON cd.id_camara  = r.id_camara
LEFT JOIN viaje_programado   vp ON vp.id_viaje   = r.id_viaje
LEFT JOIN pedido_cliente     pc ON pc.id_pedido  = vp.id_pedido
LEFT JOIN cliente_empresa    ce ON ce.id_cliente = pc.id_cliente
ORDER BY r.timestamp_evento DESC
LIMIT 1;

-- Banner superior — Alerta de auditoría automática
-- Cuenta las anomalías del día actual cuyo campo revisado_por_admin es nulo, es decir, que aún no han sido atendidas por ningún administrador. Si el resultado es mayor a cero, el sistema muestra el banner de alerta en la parte superior de la pantalla.
-- En la presentación (HACER SU NUEVO INSERT ANTES)

SELECT COUNT(*) AS anomalias_sin_revisar
FROM anomalia_acceso a
JOIN registro_acceso r ON r.id_acceso = a.id_acceso
WHERE r.revisado_por_admin IS NULL
  AND DATE(r.timestamp_evento) = CURRENT_DATE;

-- Botón — Revisar alerta de auditoría
-- Recupera el registro de auditoria_modificacion_acceso vinculado al acceso con anomalía, cruzado con administrador para obtener el nombre completo del responsable. Devuelve el campo modificado, el valor original, el valor corregido y la justificación del cambio.

SELECT
    aa.id_auditoria,
    aa.campo_modificado,
    aa.valor_original_inmutable,
    aa.valor_corregido_nuevo,
    aa.motivo_justificacion,
    aa.modificado_en,
    adm.nombres || ' ' || adm.apellidos AS modificado_por
FROM auditoria_modificacion_acceso aa
JOIN administrador adm ON adm.id_admin = aa.id_admin_modificador
WHERE aa.id_acceso_original = (
    SELECT id_acceso
    FROM registro_acceso
    WHERE placa_detectada_alpr = 'DFT-5521'
    ORDER BY timestamp_evento DESC
    LIMIT 1
)
ORDER BY aa.modificado_en DESC;
