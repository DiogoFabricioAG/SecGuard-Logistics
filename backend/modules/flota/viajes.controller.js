const service = require('./viajes.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const AppError = require('../../utils/AppError');

async function listarViajes(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { estado_viaje } = req.query;
    const { rows, total } = await service.listarViajes({ page, limit, offset, estado_viaje });
    res.json(paginatedResponse(rows, page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function detalleViaje(req, res, next) {
  try {
    const viaje = await service.detalleViaje(req.params.id);
    if (!viaje) throw new AppError('Viaje no encontrado', 404);
    res.json({ success: true, data: viaje });
  } catch (err) {
    next(err);
  }
}

async function listarCamionesDisponibles(req, res, next) {
  try {
    const { fecha } = req.query;
    if (!fecha) throw new AppError('El parametro fecha es obligatorio (YYYY-MM-DD)', 400);
    const rows = await service.listarCamionesDisponibles(fecha);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function crearViaje(req, res, next) {
  try {
    req.body.programado_por_admin = req.admin.id_admin;
    const viaje = await service.crearViaje(req.body);
    res.status(201).json({ success: true, data: viaje });
  } catch (err) {
    next(err);
  }
}

async function asignarCamion(req, res, next) {
  try {
    const { id_camion, id_conductor } = req.body;
    const asignacion = await service.asignarCamion(req.params.id, id_camion, id_conductor);
    res.status(201).json({ success: true, data: asignacion });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarViajes, detalleViaje, listarCamionesDisponibles, crearViaje, asignarCamion };
