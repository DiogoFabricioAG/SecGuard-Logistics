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

module.exports = {
  kpiCabecera,
  actividadSemanal,
  motivosDenegacion,
  ultimosEventos,
  estadoSistema,
};
