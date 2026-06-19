const pool = require("../../config/db");

async function listarKPIs(estado = "ACTIVO") {
  const { rows } = await pool.query(
    `SELECT id_kpi, nombre_kpi, categoria_operativa, unidad_medida,
            formula_defined, umbral_critico, valor_meta, umbral_alerta,
            estado_kpi, creado_en
     FROM configuracion_kpi
     WHERE estado_kpi = $1
     ORDER BY id_kpi ASC`,
    [estado],
  );
  return rows;
}

async function detalleKPI(id_kpi) {
  const { rows } = await pool.query(
    `SELECT * FROM configuracion_kpi WHERE id_kpi = $1`,
    [id_kpi],
  );
  return rows[0] || null;
}

async function disponibilidadFlota(tipo_unidad = "") {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE estado_operativo = 'DISPONIBLE') AS disponibles,
       ROUND(COUNT(*) FILTER (WHERE estado_operativo = 'DISPONIBLE') * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
     FROM camion_ransa
     WHERE $1 = '' OR tipo_unidad = $1`,
    [tipo_unidad],
  );
  return rows[0];
}

async function utilizacionFlota(tipo_unidad = "") {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE estado_operativo IN ('DISPONIBLE', 'EN_RUTA')) AS activos,
       ROUND(COUNT(*) FILTER (WHERE estado_operativo IN ('DISPONIBLE', 'EN_RUTA')) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
     FROM camion_ransa
     WHERE $1 = '' OR tipo_unidad = $1`,
    [tipo_unidad],
  );
  return rows[0];
}

async function conversionViajes(fecha_inicio = "", fecha_fin = "", tipo_unidad = "") {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE v.estado_viaje IN ('CONFIRMADO', 'EN_TRANSITO')) AS activos,
       ROUND(COUNT(*) FILTER (WHERE v.estado_viaje IN ('CONFIRMADO', 'EN_TRANSITO')) * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
     FROM viaje_programado v
     WHERE ($1 = '' OR v.fecha_hora_estimada >= $1::date)
       AND ($2 = '' OR v.fecha_hora_estimada <= $2::date + interval '1 day')
       AND ($3 = '' OR EXISTS (
         SELECT 1 FROM viaje_camion_asignado vca
         JOIN camion_ransa c ON c.id_camion = vca.id_camion
         WHERE vca.id_viaje = v.id_viaje AND c.tipo_unidad = $3
       ))`,
    [fecha_inicio, fecha_fin, tipo_unidad],
  );
  return rows[0];
}

async function prevencionMantenimiento(fecha_inicio = "", fecha_fin = "", tipo_unidad = "") {
  const { rows } = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE m.tipo_mantenimiento = 'PREVENTIVO') AS preventivos,
       COUNT(*) FILTER (WHERE m.tipo_mantenimiento = 'CORRECTIVO') AS correctivos,
       ROUND(COUNT(*) FILTER (WHERE m.tipo_mantenimiento = 'PREVENTIVO') * 100.0 / NULLIF(COUNT(*), 0), 1) AS porcentaje
     FROM mantenimiento_camion m
     JOIN camion_ransa c ON c.id_camion = m.id_camion
     WHERE ($1 = '' OR m.fecha_mantenimiento >= $1::date)
       AND ($2 = '' OR m.fecha_mantenimiento <= $2::date + interval '1 day')
       AND ($3 = '' OR c.tipo_unidad = $3)`,
    [fecha_inicio, fecha_fin, tipo_unidad],
  );
  return rows[0];
}

async function desempenoClientes(fecha_inicio = "", fecha_fin = "", zona = "") {
  const { rows } = await pool.query(
    `SELECT
       ce.razon_social AS cliente,
       COUNT(*) AS pedidos,
       COALESCE(SUM(pc.total_peso_kg), 0) AS peso_total,
       COALESCE(SUM(pc.total_bultos), 0) AS bultos_totales,
       MODE() WITHIN GROUP (ORDER BY pc.estado_pedido) AS estado_principal
     FROM pedido_cliente pc
     JOIN cliente_empresa ce ON ce.id_cliente = pc.id_cliente
     WHERE ($1 = '' OR pc.fecha_recepcion_pedido >= $1::date)
       AND ($2 = '' OR pc.fecha_recepcion_pedido <= $2::date + interval '1 day')
       AND ($3 = '' OR pc.direccion_entrega ILIKE '%' || $3 || '%')
     GROUP BY ce.id_cliente, ce.razon_social
     ORDER BY peso_total DESC`,
    [fecha_inicio, fecha_fin, zona],
  );
  return rows;
}

async function distribucionCarga(fecha_inicio = "", fecha_fin = "") {
  const { rows } = await pool.query(
    `SELECT
       d.tipo_carga,
       COUNT(*) AS total,
       ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 0) AS porcentaje
     FROM detalle_pedido_mercancia d
     JOIN pedido_cliente pc ON pc.id_pedido = d.id_pedido
     WHERE ($1 = '' OR pc.fecha_recepcion_pedido >= $1::date)
       AND ($2 = '' OR pc.fecha_recepcion_pedido <= $2::date + interval '1 day')
     GROUP BY d.tipo_carga
     ORDER BY total DESC`,
    [fecha_inicio, fecha_fin],
  );
  return rows;
}

async function resumenPeriodo(fecha_inicio = "", fecha_fin = "", zona = "") {
  const { rows } = await pool.query(
    `SELECT
       COUNT(DISTINCT pc.id_pedido) AS total_pedidos,
       COUNT(DISTINCT v.id_viaje) AS total_viajes,
       COALESCE(SUM(pc.total_peso_kg), 0) AS peso_total,
       COALESCE(SUM(pc.total_bultos), 0) AS bultos_totales
     FROM pedido_cliente pc
     LEFT JOIN viaje_programado v ON v.id_pedido = pc.id_pedido
     WHERE ($1 = '' OR pc.fecha_recepcion_pedido >= $1::date)
       AND ($2 = '' OR pc.fecha_recepcion_pedido <= $2::date + interval '1 day')
       AND ($3 = '' OR pc.direccion_entrega ILIKE '%' || $3 || '%')`,
    [fecha_inicio, fecha_fin, zona],
  );
  return rows[0];
}

module.exports = {
  listarKPIs,
  detalleKPI,
  disponibilidadFlota,
  utilizacionFlota,
  conversionViajes,
  prevencionMantenimiento,
  desempenoClientes,
  distribucionCarga,
  resumenPeriodo,
};
