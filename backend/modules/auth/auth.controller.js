const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { nombre_usuario, contrasenia } = req.body;
    const ip_origen = req.ip || req.connection.remoteAddress;
    const result = await authService.login(nombre_usuario, contrasenia, ip_origen);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const admin = await authService.getProfile(req.admin.id_admin);
    res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getProfile };
