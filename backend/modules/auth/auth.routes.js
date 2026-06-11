const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('./auth.controller');
const authenticate = require('../../middleware/auth');

const router = Router();

router.post(
  '/login',
  [
    body('nombre_usuario').notEmpty().withMessage('El nombre de usuario es obligatorio'),
    body('contrasenia').notEmpty().withMessage('La contrasenia es obligatoria'),
  ],
  controller.login
);

router.get('/me', authenticate, controller.getProfile);

module.exports = router;
