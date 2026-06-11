const { Router } = require('express');
const controller = require('./kpi.controller');
const authenticate = require('../../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/inactivos', controller.listarKPIsInactivos);
router.get('/:id', controller.detalleKPI);
router.get('/', controller.listarKPIs);

module.exports = router;
