const { validationResult } = require('express-validator');

function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new Error(JSON.stringify({
      message: 'Error de validacion',
      errors: errors.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    })));
  }
  next();
}

module.exports = validate;
