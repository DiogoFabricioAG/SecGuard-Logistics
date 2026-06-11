function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor';

  if (!err.isOperational) {
    console.error('ERROR NO OPERACIONAL:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
}

module.exports = errorHandler;
