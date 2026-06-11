const pool = require('../../config/db');

async function listarCamiones({ page, limit, offset, clasificacion_peso, estado_operativo }) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (clasificacion_peso) {
    conditions.push(`clasificacion_peso = $${paramIndex++}`);
    params.push(clasificacion_peso);
  }
  if (estado_operativo) {
    conditions.push(`estado_operativo = $${paramIndex++}`);
    params.push(estado_operativo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      id_camion, url_foto_vehiculo, placa_matricula, modelo,
      tipo_unidad, clasificacion_peso, capacidad_toneladas,
      CONCAT(
        CASE clasificacion_peso
          WHEN 'CARGA_PESADA' THEN 'Carga Pesada'
          WHEN 'CARGA_MEDIA' THEN 'Carga Media'
          WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
          ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
      ) AS tipo_capacidad_display,
      estado_operativo,
      fecha_proximo_mantenimiento,
      COUNT(*) OVER() AS total_registros
    FROM camion_ransa
    ${whereClause}
    ORDER BY id_camion ASC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  const total = rows.length > 0 ? parseInt(rows[0].total_registros, 10) : 0;

  return { rows, total };
}

async function detalleCamion(id_camion) {
  const { rows } = await pool.query(
    `SELECT
      id_camion, url_foto_vehiculo, placa_matricula, modelo,
      tipo_unidad, capacidad_toneladas, clasificacion_peso,
      CONCAT(
        CASE clasificacion_peso
          WHEN 'CARGA_PESADA' THEN 'Carga Pesada'
          WHEN 'CARGA_MEDIA' THEN 'Carga Media'
          WHEN 'COMERCIAL_LIGERO' THEN 'Comercial Ligero'
          ELSE 'Sin clasificar'
        END,
        ' / ', capacidad_toneladas::TEXT, ' T'
      ) AS tipo_capacidad_display,
      vigencia_soat, vigencia_tarjeta_propiedad,
      estado_operativo, fecha_proximo_mantenimiento,
      observaciones
    FROM camion_ransa
    WHERE id_camion = $1`,
    [id_camion]
  );
  return rows[0] || null;
}

async function eventosProximos(id_camion) {
  const { rows } = await pool.query(
    `SELECT
      'VIAJE' AS tipo_evento,
      vp.fecha_hora_estimada AS fecha_evento,
      vp.tipo_operacion AS detalle
    FROM viaje_camion_asignado vca
    JOIN viaje_programado vp ON vp.id_viaje = vca.id_viaje
    WHERE vca.id_camion = $1
      AND vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
      AND vp.fecha_hora_estimada BETWEEN CURRENT_TIMESTAMP
                                     AND CURRENT_TIMESTAMP + INTERVAL '7 days'

    UNION ALL

    SELECT
      'MANTENIMIENTO' AS tipo_evento,
      fecha_proximo_mantenimiento::TIMESTAMP AS fecha_evento,
      'PROX-MANT-' || id_camion::TEXT AS detalle
    FROM camion_ransa
    WHERE id_camion = $1
      AND fecha_proximo_mantenimiento BETWEEN CURRENT_DATE
                                          AND CURRENT_DATE + INTERVAL '7 days'

    ORDER BY fecha_evento ASC`,
    [id_camion]
  );
  return rows;
}

async function ultimosMantenimientos(id_camion) {
  const { rows } = await pool.query(
    `SELECT id_mantenimiento, tipo_mantenimiento, fecha_mantenimiento, descripcion
     FROM mantenimiento_camion
     WHERE id_camion = $1
     ORDER BY fecha_mantenimiento DESC
     LIMIT 3`,
    [id_camion]
  );
  return rows;
}

module.exports = { listarCamiones, detalleCamion, eventosProximos, ultimosMantenimientos };
