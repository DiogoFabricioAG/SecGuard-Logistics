const service = require('./accesos.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const AppError = require('../../utils/AppError');

async function historialAccesos(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { rows, total } = await service.historialAccesos({ offset, limit });
    res.json(paginatedResponse(rows, page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function accesosPorPlaca(req, res, next) {
  try {
    const rows = await service.accesosPorPlaca(req.params.placa);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function detalleAcceso(req, res, next) {
  try {
    const acceso = await service.detalleAcceso(req.params.id);
    if (!acceso) throw new AppError('Acceso no encontrado', 404);
    res.json({ success: true, data: acceso });
  } catch (err) {
    next(err);
  }
}

async function auditoriaOriginal(req, res, next) {
  try {
    const rows = await service.auditoriaOriginal(req.params.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function auditoriaCorregido(req, res, next) {
  try {
    const rows = await service.auditoriaCorregido(req.params.id);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { historialAccesos, accesosPorPlaca, detalleAcceso, auditoriaOriginal, auditoriaCorregido };
