const service = require('./kpi.service');
const AppError = require('../../utils/AppError');

const ESTADO_COLORS = {
  RECIBIDO: 'bg-[#009A3F]/10 text-[#009A3F] border-[#009A3F]/20',
  EN_PROCESO: 'bg-[#F39200]/10 text-[#F39200] border-[#F39200]/20',
  COMPLETADO: 'bg-[#009A3F]/10 text-[#009A3F] border-[#009A3F]/20',
  CANCELADO: 'bg-error/10 text-error border-error/20',
  PENDIENTE: 'bg-[#F39200]/10 text-[#F39200] border-[#F39200]/20',
};

function colorBadge(estado) {
  return ESTADO_COLORS[estado] || 'bg-surface-variant text-on-surface-variant border-outline-variant';
}

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

async function disponibilidadFlota(req, res, next) {
  try {
    const data = await service.disponibilidadFlota(req.query.tipo_unidad || '');
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function utilizacionFlota(req, res, next) {
  try {
    const data = await service.utilizacionFlota(req.query.tipo_unidad || '');
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function conversionViajes(req, res, next) {
  try {
    const data = await service.conversionViajes(
      req.query.fecha_inicio || '',
      req.query.fecha_fin || '',
      req.query.tipo_unidad || '',
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function prevencionMantenimiento(req, res, next) {
  try {
    const data = await service.prevencionMantenimiento(
      req.query.fecha_inicio || '',
      req.query.fecha_fin || '',
      req.query.tipo_unidad || '',
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function desempenoClientes(req, res, next) {
  try {
    const rows = await service.desempenoClientes(
      req.query.fecha_inicio || '',
      req.query.fecha_fin || '',
      req.query.zona || '',
    );
    const data = rows.map(r => ({
      ...r,
      peso_total: Number(r.peso_total),
      bultos_totales: Number(r.bultos_totales),
      color_badge: colorBadge(r.estado_principal),
    }));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function distribucionCarga(req, res, next) {
  try {
    const data = await service.distribucionCarga(
      req.query.fecha_inicio || '',
      req.query.fecha_fin || '',
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

async function resumenPeriodo(req, res, next) {
  try {
    const data = await service.resumenPeriodo(
      req.query.fecha_inicio || '',
      req.query.fecha_fin || '',
      req.query.zona || '',
    );
    data.peso_total = Number(data.peso_total);
    data.bultos_totales = Number(data.bultos_totales);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = {
  listarKPIs,
  listarKPIsInactivos,
  detalleKPI,
  disponibilidadFlota,
  utilizacionFlota,
  conversionViajes,
  prevencionMantenimiento,
  desempenoClientes,
  distribucionCarga,
  resumenPeriodo,
};
