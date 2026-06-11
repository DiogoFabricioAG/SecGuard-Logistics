const { Router } = require('express');
const { query, body } = require('express-validator');
const controller = require('./viajes.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get(
  '/',
  [query('estado_viaje').optional().isIn(['PENDIENTE', 'CONFIRMADO', 'EN_TRANSITO'])],
  controller.listarViajes
);

router.get('/disponibles', controller.listarCamionesDisponibles);
router.get('/:id', controller.detalleViaje);

router.post(
  '/',
  [
    body('id_pedido').isInt().withMessage('id_pedido es obligatorio'),
    body('codigo_reserva_patio').notEmpty().withMessage('codigo_reserva_patio es obligatorio'),
    body('tipo_operacion').isIn(['DESPACHO', 'RECEPCION']).withMessage('tipo_operacion invalido'),
    body('fecha_hora_estimada').isISO8601().withMessage('fecha_hora_estimada invalida'),
    body('guia_remision_ransa').notEmpty().withMessage('guia_remision_ransa es obligatorio'),
    body('fecha_limite_entrega').isISO8601().withMessage('fecha_limite_entrega invalida'),
  ],
  controller.crearViaje
);

router.post(
  '/:id/asignaciones',
  [
    body('id_camion').isInt().withMessage('id_camion es obligatorio'),
    body('id_conductor').isInt().withMessage('id_conductor es obligatorio'),
  ],
  controller.asignarCamion
);

module.exports = router;
