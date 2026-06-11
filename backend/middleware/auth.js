const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticacion no proporcionado', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return next(new AppError('Token invalido o expirado', 401));
  }
}

module.exports = authenticate;
