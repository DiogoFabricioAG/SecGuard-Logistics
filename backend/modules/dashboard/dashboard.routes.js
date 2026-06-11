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

router.get('/intento-placa/:placa', controller.ultimoIntentoPlaca);
router.get('/verificar-placa/:placa', controller.verificarPlaca);
router.get('/historial-intentos/:placa', controller.historialIntentos);

router.get('/ultima-anomalia', controller.ultimaAnomalia);
router.get('/anomalias-sin-revisar', controller.anomaliasSinRevisar);
router.get('/auditoria-anomalia/:placa', controller.auditoriaAnomalia);

module.exports = router;
