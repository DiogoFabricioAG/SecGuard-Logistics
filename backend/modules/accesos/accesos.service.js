const pool = require('../../config/db');

async function historialAccesos({ offset, limit }) {
  const { rows } = await pool.query(
    `SELECT
      ra.id_acceso, ra.timestamp_evento, ra.placa_detectada_alpr,
      ra.tipo_registro, CONCAT(c.nombres, ' ', c.apellidos) AS conductor,
      ra.tipo_evento, ra.estado_deteccion, ra.decision_acceso,
      ra.puerta_asignada,
      COUNT(*) OVER() AS total_registros
    FROM registro_acceso ra
    JOIN conductor_ransa c ON ra.id_conductor = c.id_conductor
    ORDER BY ra.timestamp_evento DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = rows.length > 0 ? parseInt(rows[0].total_registros, 4) : 0;
  return { rows, total };
}


async function ultimaDeteccion(placa) {
  const { rows } = await pool.query(
    `SELECT
      ra.id_acceso, ra.timestamp_evento, ra.placa_detectada_alpr,
      ra.tipo_evento, ra.decision_acceso, ra.puerta_asignada,
      ca.modelo, ca.tipo_unidad, ra.url_foto_captura
    FROM registro_acceso ra
    JOIN camion_ransa ca    ON ra.id_camion  = ca.id_camion
    JOIN camara_dispositivo cd ON ra.id_camara = cd.id_camara
    WHERE ra.placa_detectada_alpr = $1
    ORDER BY ra.timestamp_evento DESC
    LIMIT 1`,
    [placa]
  );
  return rows[0] || null;
}

// ── RENOMBRADO: historial paginado filtrado por placa (mismos campos que historialAccesos)
async function historialPorPlaca(placa, { offset, limit }) {
  const { rows } = await pool.query(
    `SELECT
      ra.id_acceso, ra.timestamp_evento, ra.placa_detectada_alpr,
      ra.tipo_registro, CONCAT(c.nombres, ' ', c.apellidos) AS conductor,
      ra.tipo_evento, ra.estado_deteccion, ra.decision_acceso,
      ra.puerta_asignada,
      COUNT(*) OVER() AS total_registros
    FROM registro_acceso ra
    JOIN conductor_ransa c ON ra.id_conductor = c.id_conductor
    WHERE ra.placa_detectada_alpr = $1
    ORDER BY ra.timestamp_evento DESC
    LIMIT $2 OFFSET $3`,
    [placa, limit, offset]
  );
  const total = rows.length > 0 ? parseInt(rows[0].total_registros, 4) : 0;
  return { rows, total };
}

async function detalleAcceso(id_acceso) {
  const { rows } = await pool.query(
    `SELECT
      ra.id_acceso, ra.timestamp_evento, ra.tipo_evento,
      CONCAT(co.nombres, ' ', co.apellidos) AS conductor,
      ra.placa_detectada_alpr, ra.confianza_alpr,
      ra.url_foto_captura, ra.estado_deteccion, ra.latencia_ms,
      ra.nivel_iluminacion, ra.nivel_obstruccion,
      ra.puerta_asignada, ra.muelle_dock,
      ra.estado_barrera, ra.decision_acceso, ra.tipo_registro,
      ra.prioridad_envio,
      ca.capacidad_toneladas, ca.tipo_unidad
    FROM registro_acceso ra
    JOIN conductor_ransa co ON ra.id_conductor = co.id_conductor
    JOIN camion_ransa ca    ON ra.id_camion    = ca.id_camion
    WHERE ra.id_acceso = $1`,
    [id_acceso]
  );
  return rows[0] || null;
}

async function auditoriaOriginal(id_acceso) {
  const { rows } = await pool.query(
    `SELECT
      ama.id_auditoria, ama.id_acceso_original,
      ama.valor_original_inmutable, ama.valor_corregido_nuevo,
      ama.modificado_en, ama.motivo_justificacion,
      CONCAT(a.nombres, ' ', a.apellidos) AS administrador
    FROM auditoria_modificacion_acceso ama
    JOIN administrador a ON ama.id_admin_modificador = a.id_admin
    WHERE ama.id_acceso_corregido = $1
    ORDER BY ama.modificado_en DESC`,
    [id_acceso]
  );
  return rows;
}

async function modificarAcceso({
  id_acceso_original,
  id_admin_modificador,
  campos_corregidos,  // objeto con los campos que cambió el admin
  motivo_justificacion
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Traer el registro original completo
    const { rows: [original] } = await client.query(
      `SELECT * FROM registro_acceso WHERE id_acceso = $1`,
      [id_acceso_original]
    );
    if (!original) throw new Error('Registro no encontrado');

    // 2. Mezclar original con los campos corregidos
    const merged = { ...original, ...campos_corregidos };

    // 3. Insertar nuevo registro (copia corregida)
    const { rows: [nuevo] } = await client.query(
      `INSERT INTO registro_acceso (
        id_viaje, id_camion, id_conductor, id_camara,
        tipo_evento, placa_detectada_alpr, confianza_alpr,
        url_foto_captura, timestamp_evento, estado_deteccion,
        latencia_ms, nivel_iluminacion, nivel_obstruccion,
        puerta_asignada, muelle_dock, estado_barrera,
        decision_acceso, prioridad_envio, tipo_registro,
        revisado_por_admin
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,'CORREGIDO',$19
      ) RETURNING id_acceso`,
      [
        merged.id_viaje, merged.id_camion, merged.id_conductor, merged.id_camara,
        merged.tipo_evento, merged.placa_detectada_alpr, merged.confianza_alpr,
        merged.url_foto_captura, merged.timestamp_evento, merged.estado_deteccion,
        merged.latencia_ms, merged.nivel_iluminacion, merged.nivel_obstruccion,
        merged.puerta_asignada, merged.muelle_dock, merged.estado_barrera,
        merged.decision_acceso, merged.prioridad_envio,
        id_admin_modificador
      ]
    );

    // 4. Por cada campo corregido → un registro en auditoria
    for (const [campo, valor_nuevo] of Object.entries(campos_corregidos)) {
      await client.query(
        `INSERT INTO auditoria_modificacion_acceso (
          id_acceso_original, id_acceso_corregido,
          id_admin_modificador, campo_modificado,
          valor_original_inmutable, valor_corregido_nuevo,
          motivo_justificacion
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          id_acceso_original,
          nuevo.id_acceso,
          id_admin_modificador,
          campo,
          String(original[campo] ?? ''),
          String(valor_nuevo ?? ''),
          motivo_justificacion
        ]
      );
    }

    await client.query('COMMIT');
    return { id_acceso_corregido: nuevo.id_acceso };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { historialAccesos, detalleAcceso, auditoriaOriginal, historialPorPlaca, modificarAcceso, ultimaDeteccion };
