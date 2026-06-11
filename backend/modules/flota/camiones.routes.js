const { Router } = require('express');
const { query } = require('express-validator');
const controller = require('./camiones.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get(
  '/',
  [
    query('clasificacion_peso').optional().isIn(['CARGA_PESADA', 'CARGA_MEDIA', 'COMERCIAL_LIGERO']),
    query('estado_operativo').optional().isIn(['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'INACTIVO']),
  ],
  controller.listarCamiones
);

router.get('/:id', controller.detalleCamion);
router.get('/:id/eventos-proximos', controller.eventosProximos);
router.get('/:id/mantenimientos', controller.ultimosMantenimientos);

module.exports = router;
