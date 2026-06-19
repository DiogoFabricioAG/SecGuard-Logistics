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
router.get('/intento-placa/:placa', controller.ultimoIntentoPlaca);
router.get('/verificar-placa/:placa', controller.verificarPlaca);
router.get('/historial-intentos/:placa', controller.historialIntentos);
router.get('/ultima-anomalia', controller.ultimaAnomalia);
router.get('/anomalias-sin-revisar', controller.anomaliasSinRevisar);
router.get('/auditoria-anomalia/:placa', controller.auditoriaAnomalia);
router.post('/registrar-deteccion', controller.registrarDeteccion);
router.get('/viaje-por-placa/:placa', controller.viajePorPlaca);
router.post('/upload-captura', controller.uploadCaptura);

module.exports = router;
