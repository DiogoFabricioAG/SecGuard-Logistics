const pool = require('../../config/db');

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
      AND cr.clasificacion_peso = 'CARGA_PESADA'`
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
      AND aa.tipo_anomalia = 'LECTURA_FALLIDA_ALPR'`
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
      AND ra.revisado_por_admin IS NULL`
  );
  return rows;
}

async function accesosPorDecision({ decision_acceso, tipo_evento, estado_barrera }) {
  const conditions = ['ra.revisado_por_admin IS NULL'];
  const params = [];
  let idx = 1;

  if (tipo_evento) {
    const events = tipo_evento.split(',');
    const placeholders = events.map(() => `$${idx++}`).join(', ');
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

  const { rows } = await pool.query(
    `SELECT
      ra.id_camion, ra.placa_detectada_alpr,
      ra.timestamp_evento AS fecha_hora_registro,
      ra.tipo_evento, ra.decision_acceso AS estado_registro,
      ra.estado_barrera, ra.revisado_por_admin,
      cr.modelo, cr.capacidad_toneladas,
      cr.clasificacion_peso AS tipo_vehiculo
    FROM registro_acceso ra
    INNER JOIN camion_ransa cr ON ra.id_camion = cr.id_camion
    WHERE ${conditions.join(' AND ')}`,
    params
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
      AND ra.revisado_por_admin IS NOT NULL`
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
      AND revisado_por_admin IS NOT NULL`
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
      AND aa.tipo_anomalia IN ('RESTRICCION_HORARIA_PROXIMA', 'DOCUMENTACION_VENCIDA')`
  );
  return rows;
}

module.exports = {
  completadosPesados,
  erroresLectura,
  entradasPendientes,
  accesosPorDecision,
  salidasCerradasRevisadas,
  salidasAutorizadas,
  entradasDenegadas,
};
