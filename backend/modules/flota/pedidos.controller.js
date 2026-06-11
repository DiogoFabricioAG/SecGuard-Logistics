const service = require('./pedidos.service');
const { getPagination, paginatedResponse } = require('../../utils/pagination');
const AppError = require('../../utils/AppError');

async function listarPedidosDisponibles(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const { rows, total } = await service.listarPedidosDisponibles({ offset, limit });
    res.json(paginatedResponse(rows, page, limit, total));
  } catch (err) {
    next(err);
  }
}

async function detallePedido(req, res, next) {
  try {
    const pedido = await service.detallePedido(req.params.id);
    if (!pedido) throw new AppError('Pedido no encontrado', 404);
    res.json({ success: true, data: pedido });
  } catch (err) {
    next(err);
  }
}

async function mercanciaPedido(req, res, next) {
  try {
    const mercancia = await service.mercanciaPedido(req.params.id);
    res.json({ success: true, data: mercancia });
  } catch (err) {
    next(err);
  }
}

async function capacidadPedido(req, res, next) {
  try {
    const capacidad = await service.capacidadPedido(req.params.id);
    if (!capacidad) throw new AppError('Pedido no encontrado', 404);
    res.json({ success: true, data: capacidad });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarPedidosDisponibles, detallePedido, mercanciaPedido, capacidadPedido };
