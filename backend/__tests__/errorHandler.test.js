import { describe, it, expect, vi } from 'vitest';
import errorHandler from '../middleware/errorHandler';
import AppError from '../utils/AppError';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('Error Handler Middleware', () => {
  it('should return operational error with its status code and message', () => {
    const err = new AppError('Recurso no encontrado', 404);
    const res = mockRes();
    const next = vi.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Recurso no encontrado',
        statusCode: 404,
      },
    });
  });

  it('should hide internal errors and return 500 with generic message', () => {
    const err = new Error('Database connection refused');
    const res = mockRes();
    const next = vi.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Error interno del servidor',
        statusCode: 500,
      },
    });
  });

  it('should use 500 as default if no statusCode on operational error', () => {
    const err = new AppError('Algo salio mal');
    const res = mockRes();
    const next = vi.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error.statusCode).toBe(500);
  });
});
