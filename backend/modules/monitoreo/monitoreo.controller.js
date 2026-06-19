const service = require('./monitoreo.service');

async function completadosPesados(_req, res, next) {
  try {
    const data = await service.completadosPesados();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function erroresLectura(_req, res, next) {
  try {
    const data = await service.erroresLectura();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function entradasPendientes(_req, res, next) {
  try {
    const data = await service.entradasPendientes();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function accesosPorDecision(req, res, next) {
  try {
    const { decision_acceso, tipo_evento, estado_barrera } = req.query;
    const data = await service.accesosPorDecision({ decision_acceso, tipo_evento, estado_barrera });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function salidasCerradasRevisadas(_req, res, next) {
  try {
    const data = await service.salidasCerradasRevisadas();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function salidasAutorizadas(_req, res, next) {
  try {
    const data = await service.salidasAutorizadas();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function entradasDenegadas(_req, res, next) {
  try {
    const data = await service.entradasDenegadas();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function registrarDeteccion(req, res, next) {
  try {
    const data = await service.registrarDeteccion(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

async function viajePorPlaca(req, res, next) {
  try {
    const data = await service.buscarViajePorPlaca(req.params.placa);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = {
  completadosPesados,
  erroresLectura,
  entradasPendientes,
  accesosPorDecision,
  salidasCerradasRevisadas,
  salidasAutorizadas,
  entradasDenegadas,
  registrarDeteccion,
  viajePorPlaca,
};
