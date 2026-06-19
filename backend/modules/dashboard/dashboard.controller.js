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

module.exports = {
  kpiCabecera,
  actividadSemanal,
  motivosDenegacion,
  ultimosEventos,
  estadoSistema,
};
