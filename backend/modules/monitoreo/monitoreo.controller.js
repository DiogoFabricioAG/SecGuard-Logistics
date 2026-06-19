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

const { uploadCaptura } = require("../../config/s3");

async function uploadCapturaHandler(req, res, next) {
  try {
    const { placa, imagen } = req.body;
    if (!placa || !imagen) return res.status(400).json({ success: false, error: { message: "placa e imagen requeridos" } });
    const url = await uploadCaptura(placa, imagen);
    res.status(201).json({ success: true, data: { url } });
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
  ultimoIntentoPlaca,
  verificarPlaca,
  historialIntentos,
  ultimaAnomalia,
  anomaliasSinRevisar,
  auditoriaAnomalia,
  registrarDeteccion,
  viajePorPlaca,
  uploadCaptura: uploadCapturaHandler,
};
