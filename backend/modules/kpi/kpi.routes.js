const { Router } = require('express');
const controller = require('./kpi.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

// Rutas específicas (deben ir antes de /:id)
router.get('/inactivos', controller.listarKPIsInactivos);
router.get('/disponibilidad-flota', controller.disponibilidadFlota);
router.get('/utilizacion-flota', controller.utilizacionFlota);
router.get('/conversion-viajes', controller.conversionViajes);
router.get('/prevencion-mantenimiento', controller.prevencionMantenimiento);
router.get('/desempeno-clientes', controller.desempenoClientes);
router.get('/distribucion-carga', controller.distribucionCarga);
router.get('/resumen-periodo', controller.resumenPeriodo);

// Generación de reportes
router.post('/generar-reporte', controller.generarReporte);

// Rutas genéricas (va al final para no interceptar las específicas)
router.get('/:id', controller.detalleKPI);
router.get('/', controller.listarKPIs);

module.exports = router;
