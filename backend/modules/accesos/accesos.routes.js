const { Router } = require('express');
const controller = require('./accesos.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

// accesos.router.js
router.get('/',                       controller.historialAccesos);
router.get('/:id/detalle',           controller.detalleAcceso);
router.get('/:id/auditoria/original',  controller.auditoriaOriginal);
router.post('/:id/modificar',        controller.modificarAcceso);

// Rutas por placa — SIEMPRE al final para no interceptar las anteriores
router.get('/placa/:placa',          controller.ultimaDeteccion);  // última detección
router.get('/placa/:placa/historial', controller.historialPorPlaca);

module.exports = router;
