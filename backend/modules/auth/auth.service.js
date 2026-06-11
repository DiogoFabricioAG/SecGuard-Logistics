const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');

async function login(nombre_usuario, contrasenia, ip_origen) {
  const { rows } = await pool.query(
    'SELECT id_admin, nombres, apellidos, correo_electronico, nombre_usuario, contrasenia_hash, estado_cuenta FROM administrador WHERE nombre_usuario = $1',
    [nombre_usuario]
  );

  if (rows.length === 0) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const admin = rows[0];

  if (admin.estado_cuenta !== 'ACTIVO') {
    throw new AppError('Cuenta bloqueada o inactiva. Contacte al administrador.', 403);
  }

  const validPassword = await bcrypt.compare(contrasenia, admin.contrasenia_hash);
  if (!validPassword) {
    throw new AppError('Credenciales incorrectas', 401);
  }

  const token = jwt.sign(
    {
      id_admin: admin.id_admin,
      nombre_usuario: admin.nombre_usuario,
      nombres: admin.nombres,
      apellidos: admin.apellidos,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  await pool.query(
    'INSERT INTO sesion_admin (id_admin, token_autenticacion, ip_origen, expiracion_en) VALUES ($1, $2, $3, NOW() + INTERVAL \'8 hours\')',
    [admin.id_admin, token, ip_origen]
  );

  return {
    token,
    admin: {
      id_admin: admin.id_admin,
      nombres: admin.nombres,
      apellidos: admin.apellidos,
      correo_electronico: admin.correo_electronico,
      nombre_usuario: admin.nombre_usuario,
    },
  };
}

async function getProfile(id_admin) {
  const { rows } = await pool.query(
    'SELECT id_admin, nombres, apellidos, correo_electronico, nombre_usuario, estado_cuenta, creado_en FROM administrador WHERE id_admin = $1',
    [id_admin]
  );
  if (rows.length === 0) {
    throw new AppError('Administrador no encontrado', 404);
  }
  return rows[0];
}

module.exports = { login, getProfile };
