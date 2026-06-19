const pool = require("../../config/db");

async function completadosPesados() {
  const { rows } = await pool.query(
    `SELECT
      ra.id_camion, ra.placa_detectada_alpr, ra.confianza_alpr,
      ra.estado_deteccion, ra.timestamp_evento, ra.latencia_ms,
      ra.nivel_iluminacion, ra.nivel_obstruccion, ra.revisado_por_admin,
      cr.modelo, cr.capacidad_toneladas,
      cr.clasificacion_peso AS tipo_vehiculo
    FROM registro_acceso ra
    INNER JOIN camion_ransa cr ON ra.id_camion = cr.id_camion
    WHERE ra.estado_deteccion = 'COMPLETADO'
      AND ra.nivel_iluminacion = 'NORMAL'
      AND ra.nivel_obstruccion = 'NINGUNA'
      AND ra.revisado_por_admin IS NULL
      AND cr.clasificacion_peso = 'CARGA_PESADA'`,
  );
  return rows;
}

async function erroresLectura() {
  const { rows } = await pool.query(
    `SELECT
      ra.confianza_alpr, ra.estado_deteccion, ra.latencia_ms,
      ra.nivel_iluminacion, ra.nivel_obstruccion, ra.revisado_por_admin,
      aa.id_anomalia, aa.tipo_anomalia, aa.descripcion_detallada
    FROM registro_acceso ra
    INNER JOIN anomalia_acceso aa ON ra.id_acceso = aa.id_acceso
    WHERE ra.estado_deteccion = 'ERROR EN LECTURA'
      AND ra.confianza_alpr < 30.00
      AND ra.nivel_iluminacion = 'INSUFICIENTE'
      AND ra.nivel_obstruccion = 'DETECTADA'
      AND ra.revisado_por_admin IS NULL
      AND aa.tipo_anomalia = 'LECTURA_FALLIDA_ALPR'`,
  );
  return rows;
}

async function entradasPendientes() {
  const { rows } = await pool.query(
    `SELECT
      ra.id_camion, ra.placa_detectada_alpr, ra.timestamp_evento,
      ra.tipo_evento, ra.estado_deteccion, ra.revisado_por_admin,
      c.modelo, c.capacidad_toneladas,
      c.clasificacion_peso AS tipo_vehiculo
    FROM registro_acceso ra
    INNER JOIN camion_ransa c ON ra.id_camion = c.id_camion
    WHERE ra.tipo_evento = 'ENTRADA'
      AND ra.estado_deteccion = 'COMPLETADO'
      AND ra.revisado_por_admin IS NULL`,
  );
  return rows;
}

async function accesosPorDecision({
  decision_acceso,
  tipo_evento,
  estado_barrera,
}) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (tipo_evento) {
    const events = tipo_evento.split(",");
    const placeholders = events.map(() => `$${idx++}`).join(", ");
    conditions.push(`ra.tipo_evento IN (${placeholders})`);
    params.push(...events);
  }
  if (decision_acceso) {
    conditions.push(`ra.decision_acceso = $${idx++}`);
    params.push(decision_acceso);
  }
  if (estado_barrera) {
    conditions.push(`ra.estado_barrera = $${idx++}`);
    params.push(estado_barrera);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT
      ra.id_acceso,
      ra.id_camion, ra.placa_detectada_alpr,
      ra.timestamp_evento AS fecha_hora_registro,
      ra.tipo_evento, ra.decision_acceso AS estado_registro,
      ra.estado_barrera, ra.revisado_por_admin,
      cr.modelo, cr.capacidad_toneladas,
      cr.clasificacion_peso AS tipo_vehiculo,
      ra.url_foto_captura
    FROM registro_acceso ra
    LEFT JOIN camion_ransa cr ON ra.id_camion = cr.id_camion
    ${where}
    ORDER BY ra.timestamp_evento DESC`,
    params,
  );
  return rows;
}

async function salidasCerradasRevisadas() {
  const { rows } = await pool.query(
    `SELECT
      ra.id_camion, ra.placa_detectada_alpr, ra.timestamp_evento,
      ra.tipo_evento, ra.estado_barrera, ra.revisado_por_admin,
      ra.prioridad_envio, cr.modelo, cr.capacidad_toneladas,
      cr.clasificacion_peso AS tipo_vehiculo, cr.observaciones,
      cond.dni, cond.nombres, cond.apellidos, cond.empresa_transportista,
      vp.guia_remision_ransa, pc.total_peso_kg,
      dpm.tipo_mercancia
    FROM registro_acceso ra
    INNER JOIN viaje_programado vp ON ra.id_viaje = vp.id_viaje
    INNER JOIN pedido_cliente pc ON vp.id_pedido = pc.id_pedido
    INNER JOIN detalle_pedido_mercancia dpm ON pc.id_pedido = dpm.id_pedido
    INNER JOIN camion_ransa cr ON ra.id_camion = cr.id_camion
    INNER JOIN conductor_ransa cond ON ra.id_conductor = cond.id_conductor
    WHERE ra.tipo_evento = 'SALIDA'
      AND ra.estado_barrera = 'CERRADO'
      AND ra.revisado_por_admin IS NOT NULL`,
  );
  return rows;
}

async function salidasAutorizadas() {
  const { rows } = await pool.query(
    `SELECT
      id_camion, placa_detectada_alpr, timestamp_evento,
      decision_acceso, tipo_evento, estado_barrera, revisado_por_admin
    FROM registro_acceso
    WHERE decision_acceso = 'AUTORIZADO'
      AND tipo_evento = 'SALIDA'
      AND estado_barrera = 'ABIERTO'
      AND revisado_por_admin IS NOT NULL`,
  );
  return rows;
}

async function entradasDenegadas() {
  const { rows } = await pool.query(
    `SELECT
      ra.id_camion, ra.placa_detectada_alpr, ra.timestamp_evento,
      ra.decision_acceso, ra.tipo_evento, ra.estado_barrera,
      ra.revisado_por_admin, aa.id_anomalia, aa.tipo_anomalia,
      aa.descripcion_detallada
    FROM registro_acceso ra
    LEFT JOIN anomalia_acceso aa ON ra.id_acceso = aa.id_acceso
    WHERE ra.decision_acceso = 'DENEGADO'
      AND ra.tipo_evento = 'ENTRADA'
      AND ra.estado_barrera = 'CERRADO'
      AND aa.tipo_anomalia IN ('RESTRICCION_HORARIA_PROXIMA', 'DOCUMENTACION_VENCIDA')`,
  );
  return rows;
}

async function ultimoIntentoPlaca(placa) {
  const { rows } = await pool.query(
    `SELECT
      i.placa_detectada, i.url_foto_captura, i.confianza_alpr,
      cd.ubicacion_garita AS punto_de_control,
      i.timestamp_intento AS timestamp_evento, i.decision
    FROM intento_acceso_no_registrado i
    JOIN camara_dispositivo cd ON cd.id_camara = i.id_camara
    WHERE i.placa_detectada = $1
    ORDER BY i.timestamp_intento DESC
    LIMIT 1`,
    [placa]
  );
  return rows[0] || null;
}

async function verificarPlaca(placa) {
  const { rows } = await pool.query(
    `SELECT
      CASE
        WHEN COUNT(*) = 0 THEN 'PLACA_NO_REGISTRADA'
      END AS motivo_badge
    FROM camion_ransa
    WHERE placa_matricula = $1`,
    [placa]
  );
  return rows[0] || { motivo_badge: null };
}

async function historialIntentos(placa) {
  const { rows } = await pool.query(
    `SELECT
      i.placa_detectada,
      cd.ubicacion_garita AS punto_de_control,
      i.timestamp_intento, i.confianza_alpr,
      i.decision, i.url_foto_captura
    FROM intento_acceso_no_registrado i
    JOIN camara_dispositivo cd ON cd.id_camara = i.id_camara
    WHERE i.placa_detectada = $1
    ORDER BY i.timestamp_intento DESC`,
    [placa]
  );
  return rows;
}

async function ultimaAnomalia() {
  const { rows } = await pool.query(
    `SELECT
      a.tipo_anomalia, a.descripcion_detallada, a.autorizado_preventivo,
      r.placa_detectada_alpr AS placa,
      ce.razon_social AS empresa_cliente,
      cd.ubicacion_garita AS punto_de_control,
      r.timestamp_evento, r.estado_barrera
    FROM anomalia_acceso a
    JOIN registro_acceso    r  ON r.id_acceso   = a.id_acceso
    JOIN camara_dispositivo cd ON cd.id_camara  = r.id_camara
    LEFT JOIN viaje_programado   vp ON vp.id_viaje   = r.id_viaje
    LEFT JOIN pedido_cliente     pc ON pc.id_pedido  = vp.id_pedido
    LEFT JOIN cliente_empresa    ce ON ce.id_cliente = pc.id_cliente
    ORDER BY r.timestamp_evento DESC
    LIMIT 1`
  );
  return rows[0] || null;
}

async function anomaliasSinRevisar() {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS anomalias_sin_revisar
    FROM anomalia_acceso a
    JOIN registro_acceso r ON r.id_acceso = a.id_acceso
    WHERE r.revisado_por_admin IS NULL
      AND DATE(r.timestamp_evento) = CURRENT_DATE`
  );
  return rows[0] || { anomalias_sin_revisar: 0 };
}

async function auditoriaAnomalia(placa) {
  const { rows } = await pool.query(
    `SELECT
      aa.id_auditoria, aa.campo_modificado,
      aa.valor_original_inmutable, aa.valor_corregido_nuevo,
      aa.motivo_justificacion, aa.modificado_en,
      adm.nombres || ' ' || adm.apellidos AS modificado_por
    FROM auditoria_modificacion_acceso aa
    JOIN administrador adm ON adm.id_admin = aa.id_admin_modificador
    WHERE aa.id_acceso_original = (
      SELECT id_acceso
      FROM registro_acceso
      WHERE placa_detectada_alpr = $1
      ORDER BY timestamp_evento DESC
      LIMIT 1
    )
    ORDER BY aa.modificado_en DESC`,
    [placa]
  );
  return rows;
}

async function registrarDeteccion({
  placa_detectada_alpr, confianza_alpr, tipo_evento, decision_acceso,
  estado_barrera, latencia_ms, nivel_iluminacion, nivel_obstruccion,
  id_viaje, id_camion, url_foto_captura,
}) {
  const { rows } = await pool.query(
    `INSERT INTO registro_acceso (
      placa_detectada_alpr, confianza_alpr, estado_deteccion,
      timestamp_evento, latencia_ms, nivel_iluminacion, nivel_obstruccion,
      tipo_evento, decision_acceso, estado_barrera,
      id_viaje, id_camion, id_conductor,
      revisado_por_admin, prioridad_envio, url_foto_captura
    ) VALUES ($1, $2, 'COMPLETADO', NOW(), $3, $4, $5,
      $6, $7, $8, $9, $10, NULL, NULL, NULL, $11)
    RETURNING id_acceso`,
    [placa_detectada_alpr, confianza_alpr,
      latencia_ms, nivel_iluminacion, nivel_obstruccion,
      tipo_evento, decision_acceso, estado_barrera,
      id_viaje || null, id_camion || null, url_foto_captura || null],
  );
  return rows[0];
}

async function buscarViajePorPlaca(placa) {
  const { rows } = await pool.query(
    `SELECT cr.id_camion, vca.id_viaje, vp.codigo_reserva_patio, vp.estado_viaje
     FROM camion_ransa cr
     LEFT JOIN viaje_camion_asignado vca ON cr.id_camion = vca.id_camion
     LEFT JOIN viaje_programado vp ON vca.id_viaje = vp.id_viaje
       AND vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
     WHERE cr.placa_matricula = $1
     ORDER BY vp.fecha_hora_estimada ASC
     LIMIT 1`,
    [placa]
  );
  if (rows.length === 0) return { id_camion: null, id_viaje: null };
  return {
    id_camion: rows[0].id_camion,
    id_viaje: rows[0].id_viaje || null,
    codigo_reserva: rows[0].codigo_reserva_patio || null,
  };
}

module.exports = {
  completadosPesados,
  erroresLectura,
  entradasPendientes,
  accesosPorDecision,
  salidasCerradasRevisadas,
  salidasAutorizadas,
  entradasDenegadas,
  ultimoIntentoPlaca,
  verificarPlaca,
  historialIntentos,
  ultimaAnomalia,
  anomaliasSinRevisar,
  auditoriaAnomalia,
  registrarDeteccion,
  buscarViajePorPlaca,
};

