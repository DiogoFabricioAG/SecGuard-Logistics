const { Router } = require('express');
const controller = require('./monitoreo.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/completados-pesados', controller.completadosPesados);
router.get('/errores-lectura', controller.erroresLectura);
router.get('/entradas-pendientes', controller.entradasPendientes);
router.get('/accesos-decision', controller.accesosPorDecision);
router.get('/salidas-cerradas', controller.salidasCerradasRevisadas);
router.get('/salidas-autorizadas', controller.salidasAutorizadas);
router.get('/entradas-denegadas', controller.entradasDenegadas);
router.post('/registrar-deteccion', controller.registrarDeteccion);

module.exports = router;
