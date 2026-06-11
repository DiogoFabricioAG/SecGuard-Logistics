const { Router } = require('express');
const controller = require('./pedidos.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/', controller.listarPedidosDisponibles);
router.get('/:id', controller.detallePedido);
router.get('/:id/mercancia', controller.mercanciaPedido);
router.get('/:id/capacidad', controller.capacidadPedido);

module.exports = router;
