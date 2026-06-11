const pool = require('../../config/db');

async function kpiCabecera() {
  const { rows } = await pool.query(
    `SELECT
      total_vehiculos, total_autorizados, total_denegados,
      var_pct_vehiculos, var_pct_autorizados, var_pct_denegados
    FROM snapshot_kpi_diario
    WHERE fecha_snapshot = CURRENT_DATE`
  );
  return rows[0] || null;
}

async function actividadSemanal() {
  const { rows } = await pool.query(
    `SELECT
      fecha_snapshot,
      TO_CHAR(fecha_snapshot, 'DY') AS dia_semana,
      total_autorizados,
      total_denegados
    FROM snapshot_kpi_diario
    WHERE fecha_snapshot >= CURRENT_DATE - INTERVAL '6 days'
    ORDER BY fecha_snapshot ASC`
  );
  return rows;
}

async function motivosDenegacion() {
  const { rows } = await pool.query(
    `SELECT
      m.tipo_motivo,
      COUNT(*) AS total,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 0) AS porcentaje
    FROM motivo_acceso m
    JOIN registro_acceso r ON r.id_acceso = m.id_acceso
    WHERE DATE(r.timestamp_evento) >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY m.tipo_motivo
    ORDER BY total DESC`
  );
  return rows;
}

async function ultimosEventos() {
  const { rows } = await pool.query(
    `SELECT
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
    LIMIT 10`
  );
  return rows;
}

async function estadoSistema() {
  const { rows } = await pool.query(
    `SELECT alertas_activas, uptime_pct
    FROM metrica_operacional_sistema
    ORDER BY fecha_hora DESC
    LIMIT 1`
  );
  return rows[0] || null;
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

module.exports = {
  kpiCabecera,
  actividadSemanal,
  motivosDenegacion,
  ultimosEventos,
  estadoSistema,
  ultimoIntentoPlaca,
  verificarPlaca,
  historialIntentos,
  ultimaAnomalia,
  anomaliasSinRevisar,
  auditoriaAnomalia,
};
