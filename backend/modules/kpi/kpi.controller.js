const service = require('./kpi.service');
const AppError = require('../../utils/AppError');

async function listarKPIs(req, res, next) {
  try {
    const data = await service.listarKPIs('ACTIVO');
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function listarKPIsInactivos(req, res, next) {
  try {
    const data = await service.listarKPIs('INACTIVO');
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function detalleKPI(req, res, next) {
  try {
    const kpi = await service.detalleKPI(req.params.id);
    if (!kpi) throw new AppError('KPI no encontrado', 404);
    res.json({ success: true, data: kpi });
  } catch (err) { next(err); }
}

module.exports = { listarKPIs, listarKPIsInactivos, detalleKPI };
