import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const API_URL = process.env.VITE_API_URL || 'http://localhost:8080';

import { api, ApiError } from '../shared/api/client';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('api.get', () => {
    it('should make a GET request and return data on success', async () => {
      const mockData = { success: true, data: { id: 1, name: 'Test' } };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      const result = await api.get('/api/health');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/health`,
        expect.objectContaining({ method: 'GET' })
      );
      expect((result as any).data).toEqual({ id: 1, name: 'Test' });
    });

    it('should throw ApiError on failed response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: false,
            error: { message: 'Not found', statusCode: 404 },
          }),
        status: 404,
      });

      try {
        await api.get('/api/not-found');
        expect.fail('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).statusCode).toBe(404);
        expect((err as ApiError).message).toBe('Not found');
      }
    });

    it('should include Authorization header if token exists', async () => {
      localStorage.setItem('token', 'test-jwt-token');
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await api.get('/api/auth/me');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBe('Bearer test-jwt-token');
    });

    it('should not include Authorization header if no token', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await api.get('/api/health');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers.Authorization).toBeUndefined();
    });
  });

  describe('api.post', () => {
    it('should make a POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: { token: 'abc', admin: {} },
          }),
      });

      await api.post('/api/auth/login', {
        nombre_usuario: 'admin',
        contrasenia: 'pass',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe(`${API_URL}/api/auth/login`);
      expect(options.method).toBe('POST');
      expect(options.body).toBe(
        JSON.stringify({ nombre_usuario: 'admin', contrasenia: 'pass' })
      );
    });

    it('should send POST without body if no body provided', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      await api.post('/api/health');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBeUndefined();
    });
  });
});
