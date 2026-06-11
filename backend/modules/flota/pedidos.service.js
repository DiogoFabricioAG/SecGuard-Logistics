const pool = require('../../config/db');

async function listarPedidosDisponibles({ offset, limit }) {
  const { rows } = await pool.query(
    `SELECT
      pc.id_pedido, pc.nro_orden_origen, pc.fecha_recepcion_pedido,
      ce.razon_social AS nombre_cliente, pc.total_bultos, pc.total_peso_kg,
      pc.direccion_entrega, pc.estado_pedido,
      COUNT(*) OVER() AS total_registros
    FROM pedido_cliente pc
    JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
    WHERE pc.estado_pedido IN ('RECIBIDO', 'EN_PROCESO')
      AND pc.id_pedido NOT IN (
        SELECT vp.id_pedido
        FROM viaje_programado vp
        WHERE vp.estado_viaje IN ('PENDIENTE', 'CONFIRMADO', 'EN_TRANSITO')
      )
    ORDER BY pc.fecha_recepcion_pedido ASC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  const total = rows.length > 0 ? parseInt(rows[0].total_registros, 10) : 0;
  return { rows, total };
}

async function detallePedido(id_pedido) {
  const { rows } = await pool.query(
    `SELECT
      pc.id_pedido, pc.nro_orden_origen, pc.fecha_recepcion_pedido,
      pc.estado_pedido, pc.total_bultos, pc.total_peso_kg,
      pc.descripcion_restricciones, pc.contacto_nombre,
      pc.contacto_telefono, pc.contacto_correo,
      pc.direccion_entrega, pc.latitud, pc.longitud,
      ce.razon_social AS nombre_cliente, ce.sector_industrial
    FROM pedido_cliente pc
    JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
    WHERE pc.id_pedido = $1`,
    [id_pedido]
  );
  return rows[0] || null;
}

async function mercanciaPedido(id_pedido) {
  const { rows } = await pool.query(
    `SELECT id_detalle, descripcion_mercancia, tipo_carga,
            cantidad_bultos, peso_subtotal_kg, requiere_camion_especial,
            tipo_mercancia
     FROM detalle_pedido_mercancia
     WHERE id_pedido = $1
     ORDER BY id_detalle ASC`,
    [id_pedido]
  );
  return rows;
}

async function capacidadPedido(id_pedido) {
  const { rows } = await pool.query(
    `SELECT
      pc.total_bultos, pc.total_peso_kg,
      SUM(CASE WHEN dm.tipo_carga = 'REFRIGERADA' THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_refrigerada_kg,
      SUM(CASE WHEN dm.tipo_carga = 'SECA' THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_seca_kg,
      SUM(CASE WHEN dm.tipo_carga = 'MATPEL' THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_matpel_kg,
      SUM(CASE WHEN dm.tipo_carga = 'GENERAL' THEN dm.peso_subtotal_kg ELSE 0 END) AS peso_general_kg,
      BOOL_OR(dm.requiere_camion_especial = 'REFRIGERADO') AS requiere_refrigerado,
      BOOL_OR(dm.requiere_camion_especial = 'MATPEL') AS requiere_matpel
    FROM pedido_cliente pc
    JOIN detalle_pedido_mercancia dm ON dm.id_pedido = pc.id_pedido
    WHERE pc.id_pedido = $1
    GROUP BY pc.total_bultos, pc.total_peso_kg`,
    [id_pedido]
  );
  return rows[0] || null;
}

module.exports = { listarPedidosDisponibles, detallePedido, mercanciaPedido, capacidadPedido };
