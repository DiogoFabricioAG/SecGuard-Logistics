import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';
import express from 'express';

const app = express();
app.use(express.json());
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'SecGuard Logistics API v1.0.0' });
});

const request = supertest(app);

describe('GET /api/health', () => {
  it('should return status 200 with success and version info', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('SecGuard Logistics API');
  });
});
