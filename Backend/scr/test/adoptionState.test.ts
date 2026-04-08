import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll } from '../adoptionState/adoptionState.controller';
import { AdoptionState } from '../adoptionState/adoptionState.entity';
import { orm } from '../zshare/db/orm';

// Mock del ORM
vi.mock('../zshare/db/orm', () => {
  return {
    orm: {
      em: {
        find: vi.fn(),
      },
    },
  };
});

describe('AdoptionState Controller - findAll', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      user: {
        role: 'ADMIN',
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  it('debería devolver todos los adoptionStates (ADMIN)', async () => {
    const mockData = [
      { id: 1, type: 'Pendiente' },
      { id: 2, type: 'Aceptado' },
      { id: 3, type: 'Enviado' },
      { id: 4, type: 'Entregado' },
      { id: 5, type: 'Cancelado' },
    ];

    (orm.em.find as any).mockResolvedValue(mockData);

    await findAll(req, res);

    expect(orm.em.find).toHaveBeenCalledWith(
      AdoptionState,
      {},
      {
        orderBy: { type: 'ASC' },
      }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'all adoptionStates',
      data: mockData,
    });
  });

  it('debería manejar errores', async () => {
    (orm.em.find as any).mockRejectedValue(new Error('DB error'));

    await findAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'DB error',
    });
  });
});