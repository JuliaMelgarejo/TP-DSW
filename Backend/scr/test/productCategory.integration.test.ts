import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '../../app';

vi.mock('../../scr/validate-token/validate-token.routes.js', () => ({
  validateToken: (req: any, res: any, next: any) => {
    req.user = { role: 'SHELTER' };
    next();
  },
}));

describe('Category Integration', () => {

  it('GET /category debería devolver categorías', async () => {
    const res = await request(app)
      .get('/api/category')
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

});