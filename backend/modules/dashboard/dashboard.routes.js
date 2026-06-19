const { Router } = require('express');
const controller = require('./dashboard.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/kpi-cabecera', controller.kpiCabecera);
router.get('/actividad-semanal', controller.actividadSemanal);
router.get('/motivos-denegacion', controller.motivosDenegacion);
router.get('/ultimos-eventos', controller.ultimosEventos);
router.get('/estado-sistema', controller.estadoSistema);

module.exports = router;
