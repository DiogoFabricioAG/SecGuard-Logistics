const pool = require('../../config/db');
const AppError = require('../../utils/AppError');

async function listarViajes({ page, limit, offset, estado_viaje }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (estado_viaje) {
    conditions.push(`vp.estado_viaje = $${idx++}`);
    params.push(estado_viaje);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      vp.id_viaje, vp.codigo_reserva_patio,
      ce.razon_social AS nombre_cliente,
      vp.tipo_operacion, vp.fecha_hora_estimada,
      vp.fecha_limite_entrega,
      COUNT(vca.id_camion) AS cantidad_camiones,
      vp.estado_viaje,
      COUNT(*) OVER() AS total_registros
    FROM viaje_programado vp
    JOIN pedido_cliente pc ON pc.id_pedido = vp.id_pedido
    JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
    LEFT JOIN viaje_camion_asignado vca ON vca.id_viaje = vp.id_viaje
    ${whereClause}
    GROUP BY vp.id_viaje, vp.codigo_reserva_patio,
             ce.razon_social, vp.tipo_operacion,
             vp.fecha_hora_estimada, vp.fecha_limite_entrega,
             vp.estado_viaje
    ORDER BY vp.fecha_hora_estimada ASC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  const total = rows.length > 0 ? parseInt(rows[0].total_registros, 10) : 0;
  return { rows, total };
}

async function detalleViaje(id_viaje) {
  const { rows } = await pool.query(
    `SELECT
      vp.id_viaje, vp.codigo_reserva_patio, vp.tipo_operacion,
      vp.fecha_hora_estimada, vp.fecha_limite_entrega,
      vp.hora_recogida_inicio, vp.hora_recogida_fin,
      vp.guia_remision_ransa, vp.estado_viaje,
      pc.id_pedido, pc.nro_orden_origen, pc.total_bultos, pc.total_peso_kg,
      pc.direccion_entrega, pc.latitud, pc.longitud,
      pc.contacto_nombre, pc.contacto_telefono, pc.contacto_correo,
      pc.descripcion_restricciones,
      ce.razon_social AS nombre_cliente, ce.ruc
    FROM viaje_programado vp
    JOIN pedido_cliente pc ON pc.id_pedido = vp.id_pedido
    JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
    WHERE vp.id_viaje = $1`,
    [id_viaje]
  );
  return rows[0] || null;
}

async function listarCamionesDisponibles(fecha) {
  const { rows } = await pool.query(
    `SELECT
      cr.id_camion, cr.url_foto_vehiculo, cr.placa_matricula,
      cr.modelo, cr.tipo_unidad, cr.clasificacion_peso,
      cr.capacidad_toneladas, cr.estado_operativo,
      cr.fecha_proximo_mantenimiento,
      COUNT(*) OVER() AS total_registros
    FROM camion_ransa cr
    WHERE cr.estado_operativo = 'DISPONIBLE'
      AND (cr.fecha_proximo_mantenimiento IS NULL OR cr.fecha_proximo_mantenimiento != $1::DATE)
      AND cr.id_camion NOT IN (
        SELECT vca.id_camion
        FROM viaje_camion_asignado vca
        JOIN viaje_programado vp ON vp.id_viaje = vca.id_viaje
        WHERE vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO')
          AND vp.fecha_hora_estimada::DATE = $1::DATE
      )
    ORDER BY cr.capacidad_toneladas DESC`,
    [fecha]
  );
  return rows;
}

async function crearViaje(data) {
  const { rows } = await pool.query(
    `INSERT INTO viaje_programado (
      id_pedido, codigo_reserva_patio, tipo_operacion,
      fecha_hora_estimada, guia_remision_ransa, estado_viaje,
      programado_por_admin, fecha_limite_entrega,
      hora_recogida_inicio, hora_recogida_fin
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id_viaje`,
    [
      data.id_pedido, data.codigo_reserva_patio, data.tipo_operacion,
      data.fecha_hora_estimada, data.guia_remision_ransa, 'PENDIENTE',
      data.programado_por_admin, data.fecha_limite_entrega,
      data.hora_recogida_inicio, data.hora_recogida_fin,
    ]
  );
  return rows[0];
}

async function asignarCamion(id_viaje, id_camion, id_conductor) {
  const { rows } = await pool.query(
    `INSERT INTO viaje_camion_asignado (id_viaje, id_camion, id_conductor)
     VALUES ($1, $2, $3) RETURNING id_asignacion`,
    [id_viaje, id_camion, id_conductor]
  );
  return rows[0];
}

module.exports = { listarViajes, detalleViaje, listarCamionesDisponibles, crearViaje, asignarCamion };
