const service = require('./camiones.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const AppError = require('../../utils/AppError');

async function listarCamiones(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { clasificacion_peso, estado_operativo } = req.query;
    const { rows, total } = await service.listarCamiones({
      page, limit, offset, clasificacion_peso, estado_operativo,
    });
    res.json(paginatedResponse(rows, page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function detalleCamion(req, res, next) {
  try {
    const camion = await service.detalleCamion(req.params.id);
    if (!camion) throw new AppError('Camion no encontrado', 404);
    res.json({ success: true, data: camion });
  } catch (err) {
    next(err);
  }
}

async function eventosProximos(req, res, next) {
  try {
    const eventos = await service.eventosProximos(req.params.id);
    res.json({ success: true, data: eventos });
  } catch (err) {
    next(err);
  }
}

async function ultimosMantenimientos(req, res, next) {
  try {
    const mantenimientos = await service.ultimosMantenimientos(req.params.id);
    res.json({ success: true, data: mantenimientos });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarCamiones, detalleCamion, eventosProximos, ultimosMantenimientos };
