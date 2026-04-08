import request from 'supertest';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { app } from '../../app'; // tu express app
import { orm } from '../zshare/db/orm';

describe('AdoptionState Integration', () => {
  beforeAll(async () => {
    // opcional: seedear datos
    vi.mock('../../scr/validate-token/validate-token.routes.js', () => ({
      validateToken: (req: any, res: any, next: any) => {
        req.user = { role: 'SHELTER' };
        next();
      },
    }));
  });
  it('GET /adoptionState debería devolver datos', async () => {
    const res = await request(app)
      .get('/api/adoptionState')
      .set('Authorization', 'Bearer fake-token'); 
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

});