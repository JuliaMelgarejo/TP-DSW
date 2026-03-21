import { Request, Response } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Animal } from './animal.entity.js';

const em = orm.em;

// ===========================
// LISTA (filtra si role = SHELTER)
// ===========================
async function findAll(req: Request, res: Response) {
  try {
    const { sort, breedId, shelterId, minRescueDate, maxRescueDate, page = 1, limit = 10} = req.query;

    const user = (req as any).user;
    const userShelterId = Number(user?.shelterId);

    const where: any = {}
    const orderBy: any = {}

    // Filtros
    if (breedId){
      where.breed = { id: Number(breedId) }
    }

    if (shelterId && !userShelterId) {
      where.rescueClass = { shelters: Number(shelterId) };
    } else if (userShelterId) {
      where.rescueClass = { shelters: Number(userShelterId) };
    }

    if (minRescueDate || maxRescueDate) {
      where.rescueClass = {
        ...where.rescueClass,
        rescue_date: {}
      };

      if (minRescueDate) {
        where.rescueClass.rescue_date.$gte = new Date(String(minRescueDate));
      }

      if (maxRescueDate) {
        where.rescueClass.rescue_date.$lte = new Date(String(maxRescueDate));
      }
    }

    // Ordenamiento

    if (sort === 'name_asc') orderBy.name = 'ASC'
    if (sort === 'name_desc') orderBy.name = 'DESC'
    if (sort === 'rescue_date') orderBy.rescueClass = { rescue_date: 'ASC' }
    if (sort === 'breed') orderBy.breed = { name: 'ASC' }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const [animals, total] = await em.findAndCount(Animal, where, {
      populate: [
        'rescueClass',
        'breed',
        'user',
        'photos',
        'rescueClass.address',
        'rescueClass.shelters',
      ],
      orderBy,
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber
    });

    return res.status(200).json({ 
      message: 'found animals',
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      limit: limitNumber,
      data: animals 
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// DETALLE (protegido por shelterAnimalGuard en routes)
// guard deja req.animal si es SHELTER
// ===========================
async function findOne(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role || '').toUpperCase();

    // Si venís de SHELTER, el guard ya cargó el animal autorizado
    if (role === 'SHELTER' && (req as any).animal) {
      const animal = (req as any).animal;

      // si querés el populate completo:
      await em.populate(animal, ['rescueClass', 'breed', 'user', 'photos', 'rescueClass.address', 'rescueClass.shelters']);

      return res.status(200).json({data: animal });
    }

    // Si es USER u otro rol, lo buscamos normal
    const id = Number.parseInt(req.params.id);
    const animal = await em.findOneOrFail(
      Animal,
      { id },
      { populate: ['rescueClass', 'breed', 'user', 'photos', 'rescueClass.address', 'rescueClass.shelters'] }
    );

    return res.status(200).json({data: animal });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// CREATE
// (si querés: acá después podemos agregar un "onlyShelter" o check de que el rescueClass pertenezca al shelter)
// ===========================
async function add(req: Request, res: Response) {
  try {
    const animal = em.create(Animal, req.body);
    await em.flush();

    return res.status(201).json({ message: 'animal created', data: animal });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// UPDATE (protegido por shelterAnimalGuard en routes)
// ===========================
async function update(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role || '').toUpperCase();

    // SHELTER: ya viene validado y cargado
    if (role === 'SHELTER' && (req as any).animal) {
      const animal = (req as any).animal;
      em.assign(animal, req.body);
      await em.flush();
      return res.status(200).json({ message: 'animal updated' });
    }

    // USER/u otro rol: actualiza por id (si querés restringir, se puede)
    const id = Number.parseInt(req.params.id);
    const animal = em.getReference(Animal, id);
    em.assign(animal, req.body);
    await em.flush();

    return res.status(200).json({ message: 'animal updated' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// DELETE (protegido por shelterAnimalGuard en routes)
// ===========================
async function remove(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role || '').toUpperCase();

    // SHELTER: ya viene validado y cargado
    if (role === 'SHELTER' && (req as any).animal) {
      const animal = (req as any).animal;
      await em.removeAndFlush(animal);
      return res.status(200).json({ message: 'animal deleted' });
    }

    // USER/u otro rol:
    const id = Number.parseInt(req.params.id);
    const animal = em.getReference(Animal, id);
    await em.removeAndFlush(animal);

    return res.status(200).json({ message: 'animal deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function findByShelter(req: Request, res: Response) {
  try {
    const shelterId = Number(req.params.shelterId);

    if (!shelterId || Number.isNaN(shelterId)) {
      return res.status(400).json({ message: 'shelterId inválido' });
    }

    const animals = await em.find(
      Animal,
      { rescueClass: { shelters: shelterId as any } } as any,
      {
        populate: [
          'rescueClass',
          'breed',
          'user',
          'photos',
          'rescueClass.address',
          'rescueClass.shelters',
        ],
      }
    );

    return res.status(200).json({ message: 'found animals by shelter', data: animals });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export { findAll, findOne, add, update, remove, findByShelter };