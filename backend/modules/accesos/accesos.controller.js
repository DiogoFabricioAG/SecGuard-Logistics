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

async function ultimaDeteccion(req, res, next) {
  try {
    const data = await service.ultimaDeteccion(req.params.placa);
    if (!data) throw new AppError('Sin registros para esa placa', 404);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function historialPorPlaca(req, res, next) {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { rows, total } = await service.historialPorPlaca(req.params.placa, { offset, limit });
    res.json(paginatedResponse(rows, page, limit, total));
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

async function modificarAcceso(req, res, next) {
  try {
    const id_acceso_original = parseInt(req.params.id);
    const { campos_corregidos, motivo_justificacion } = req.body;
    const id_admin_modificador = req.admin.id_admin;

    if (!campos_corregidos || Object.keys(campos_corregidos).length === 0)
      throw new AppError('Debes corregir al menos un campo', 400);
    if (!motivo_justificacion?.trim())
      throw new AppError('El motivo de corrección es obligatorio', 400);

    const resultado = await service.modificarAcceso({
      id_acceso_original,
      id_admin_modificador,
      campos_corregidos,
      motivo_justificacion
    });
    res.status(201).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  historialAccesos,
  ultimaDeteccion,
  historialPorPlaca,
  detalleAcceso,
  auditoriaOriginal,
  modificarAcceso
};
