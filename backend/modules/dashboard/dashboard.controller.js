const service = require('./dashboard.service');

async function kpiCabecera(_req, res, next) {
  try {
    const data = await service.kpiCabecera();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function actividadSemanal(_req, res, next) {
  try {
    const data = await service.actividadSemanal();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function motivosDenegacion(_req, res, next) {
  try {
    const data = await service.motivosDenegacion();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function ultimosEventos(_req, res, next) {
  try {
    const data = await service.ultimosEventos();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function estadoSistema(_req, res, next) {
  try {
    const data = await service.estadoSistema();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function ultimoIntentoPlaca(req, res, next) {
  try {
    const data = await service.ultimoIntentoPlaca(req.params.placa);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function verificarPlaca(req, res, next) {
  try {
    const data = await service.verificarPlaca(req.params.placa);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function historialIntentos(req, res, next) {
  try {
    const data = await service.historialIntentos(req.params.placa);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function ultimaAnomalia(_req, res, next) {
  try {
    const data = await service.ultimaAnomalia();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function anomaliasSinRevisar(_req, res, next) {
  try {
    const data = await service.anomaliasSinRevisar();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function auditoriaAnomalia(req, res, next) {
  try {
    const data = await service.auditoriaAnomalia(req.params.placa);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = {
  kpiCabecera,
  actividadSemanal,
  motivosDenegacion,
  ultimosEventos,
  estadoSistema,
  ultimoIntentoPlaca,
  verificarPlaca,
  historialIntentos,
  ultimaAnomalia,
  anomaliasSinRevisar,
  auditoriaAnomalia,
};
