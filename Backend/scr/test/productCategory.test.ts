import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll } from '../productCategory/productCategory.controller';
import { orm } from '../zshare/db/orm';
import { Category } from '../productCategory/productCategory.entity';

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

describe('ProductCategory Controller - findAll', () => {
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
      {id: 1, name: "Comida", description: "Productos alimenticios" },
      {id: 2, name: "Ropa", description: "Indumentaria y accesorios" },
      {id: 3, name: "Hogar", description: "Artículos para el hogar" },
      {id: 4, name: "Juguetes", description: "Juguetes para mascotas" },
      {id: 5, name: "Camas", description: "Camas para mascotas" }
    ];

    (orm.em.find as any).mockResolvedValue(mockData);

    await findAll(req, res);

    expect(orm.em.find).toHaveBeenCalledWith(
      Category,
      {},

    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'all categorys: ',
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