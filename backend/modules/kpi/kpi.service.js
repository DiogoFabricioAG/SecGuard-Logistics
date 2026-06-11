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

module.exports = { listarKPIs, detalleKPI };
