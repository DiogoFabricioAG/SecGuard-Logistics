import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from '../middleware/auth';

function mockReq(headers = {}) {
  return { headers };
}

describe('Auth Middleware - authenticate', () => {
  it('should call next with 401 error if no authorization header', () => {
    const req = mockReq();
    const next = vi.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
    expect(err.message).toContain('Token de autenticacion no proporcionado');
  });

  it('should call next with 401 if header does not start with Bearer', () => {
    const req = mockReq({ authorization: 'Basic abc123' });
    const next = vi.fn();

    authenticate(req, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should call next with 401 if token is invalid', () => {
    const req = mockReq({ authorization: 'Bearer invalid-token' });
    const next = vi.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Token invalido o expirado');
  });

  it('should call next() and set req.admin with decoded payload on valid token', () => {
    const payload = { id_admin: 1, nombre_usuario: 'admin', nombres: 'Admin', apellidos: 'Test' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const req = mockReq({ authorization: `Bearer ${token}` });
    const next = vi.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.admin).toMatchObject(payload);
  });
});
