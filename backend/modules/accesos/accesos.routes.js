const { Router } = require('express');
const controller = require('./accesos.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/', controller.historialAccesos);
router.get('/placa/:placa', controller.accesosPorPlaca);
router.get('/:id', controller.detalleAcceso);
router.get('/:id/auditoria-original', controller.auditoriaOriginal);
router.get('/:id/auditoria-corregido', controller.auditoriaCorregido);

module.exports = router;
