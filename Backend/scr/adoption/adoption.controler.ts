import { Request, Response, NextFunction } from 'express';
import { Adoption } from './adoption.entity.js';
import { orm } from '../zshare/db/orm.js';
import { Animal } from '../animal/animal.entity.js';
import { Person } from '../person/person.entity.js';
import { AdoptionState } from '../adoptionState/adoptionState.entity.js';
import { AdoptionStatus } from '../adoptionStatus/adoptionStatus.entity.js';

const em = orm.em;

// ===========================
// SANITIZE
// ===========================
function sanitizeAdoptionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedAdoption = {
    comments: req.body.comments,
  };

  if (req.body.sanitizedAdoption) {
    Object.keys(req.body.sanitizedAdoption).forEach((key) => {
      if ((req.body.sanitizedAdoption as any)[key] === undefined) {
        delete (req.body.sanitizedAdoption as any)[key];
      }
    });
  }

  next();
}

// ===========================
// HELPERS (DTO)
// ===========================
function getStatusesArray(a: any): any[] {
  if (a?.statuses?.getItems) return a.statuses.getItems();
  return a?.statuses ?? [];
}

function getLatestStateType(a: any): string {
  const statuses = getStatusesArray(a);
  if (!Array.isArray(statuses) || statuses.length === 0) return 'PENDIENTE';

  const latest = [...statuses].sort(
    (x: any, y: any) =>
      new Date(y?.statusChangeDate ?? 0).getTime() - new Date(x?.statusChangeDate ?? 0).getTime()
  )[0];

  return latest?.adoptionState?.type ?? 'PENDIENTE';
}

function toShelterListDto(a: any) {
  const latest = getLatestStateType(a);
  const current = latest || (a?.deleted_at ? 'CANCELADO' : 'PENDIENTE');

  return {
    id: a.id,
    adoption_date: a.adoption_date,
    comments: a.comments ?? '',

    deleted_at: a.deleted_at ?? null,
    isDeleted: !!a.deleted_at,

    animal: {
      id: a.animal?.id,
      name: a.animal?.name,
      photos: a.animal?.photos ?? [],
    },

    applicant: {
      id: a.person?.id,
      name: a.person?.name ?? a.person?.firstName ?? '—',
      email: a.person?.email ?? null,
      phone: a.person?.phone ?? null,
    },

    currentState: current,
  };
}

function toMineListDto(a: any) {
  return {
    id: a.id,
    adoption_date: a.adoption_date,
    comments: a.comments ?? '',
    animal: {
      id: a.animal?.id,
      name: a.animal?.name,
      photos: a.animal?.photos ?? [],
    },
    currentState: getLatestStateType(a),
  };
}

// ===========================
// LISTS
// ===========================
async function findAll(req: Request, res: Response) {
  try {
    const adoption = await em.find(Adoption, { deleted_at: null as any });
    res.status(200).json({ message: 'all adoptions: ', data: adoption });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const adoption = await em.findOne(
      Adoption,
      { id, deleted_at: null as any },
      { populate: ['animal', 'animal.photos', 'person', 'statuses', 'statuses.adoptionState'] }
    );

    if (!adoption) return res.status(404).json({ message: 'Solicitud no encontrada' });

    res.status(200).json({ message: 'adoption data: ', data: adoption });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findMine(req: Request, res: Response) {
  // USER: no ve las eliminadas
  try {
    const personId = Number((req as any).user?.personId);
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const adoptions = await em.find(
      Adoption,
      { person: personId as any, deleted_at: null as any },
      {
        populate: ['animal', 'animal.photos', 'statuses', 'statuses.adoptionState'],
        orderBy: { adoption_date: 'DESC' as any },
      }
    );

    const data = adoptions.map(toMineListDto);
    res.status(200).json({ message: 'my adoptions', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findForShelter(req: Request, res: Response) {
  // SHELTER: ve eliminadas
  try {
    const shelterId = Number((req as any).user?.shelterId);
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const adoptions = await em.find(
      Adoption,
      { animal: { rescueClass: { shelters: shelterId as any } } } as any,
      {
        populate: [
          'animal',
          'animal.photos',
          'animal.rescueClass',
          'animal.rescueClass.shelters',
          'person',
          'statuses',
          'statuses.adoptionState',
        ],
        orderBy: { adoption_date: 'DESC' as any },
      }
    );

    const data = adoptions.map(toShelterListDto);
    res.status(200).json({ message: 'shelter adoptions', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOneForShelter(req: Request, res: Response) {
  // SHELTER: puede ver el detalle aunque esté eliminada
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const shelterId = Number((req as any).user?.shelterId);
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const adoption = await em.findOne(
      Adoption,
      { id },
      {
        populate: [
          'animal',
          'animal.photos',
          'animal.rescueClass',
          'animal.rescueClass.shelters',
          'person',
          'statuses',
          'statuses.adoptionState',
        ],
      }
    );

    if (!adoption) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const adoptionShelterId = (adoption as any).animal?.rescueClass?.shelters?.id;
    if (Number(adoptionShelterId) !== shelterId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.status(200).json({ message: 'adoption detail for shelter', data: adoption });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// ===========================
// CREATE: USER
// ===========================
async function add(req: Request, res: Response) {
  try {
    const animalId = Number.parseInt(req.params.animalId);
    const personId = Number((req as any).user?.personId);

    if (Number.isNaN(animalId) || !animalId) return res.status(400).json({ message: 'animalId inválido' });
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const input = req.body.sanitizedAdoption ?? {};

    const existing = await em.findOne(Adoption, {
      animal: animalId as any,
      person: personId as any,
      deleted_at: null as any,
    });

    if (existing) {
      return res.status(409).json({ message: 'Ya existe una solicitud para este animal' });
    }

    const adoption = em.create(Adoption, {
      comments: input.comments,
      adoption_date: new Date(),
      animal: em.getReference(Animal, animalId),
      person: em.getReference(Person, personId),
    });

    await em.persistAndFlush(adoption);

    const pendingState =
      (await em.findOne(AdoptionState, { type: 'PENDIENTE' })) ??
      (await em.findOne(AdoptionState, { type: 'pendiente' }));

    if (!pendingState) {
      return res.status(500).json({ message: 'No existe AdoptionState PENDIENTE precargado' });
    }

    const status = em.create(AdoptionStatus, {
      statusChangeDate: new Date(),
      reason: 'Solicitud creada',
      adoption,
      adoptionState: pendingState,
    });

    await em.persistAndFlush(status);

    const created = await em.findOneOrFail(
      Adoption,
      { id: adoption.id },
      { populate: ['animal', 'animal.photos', 'person', 'statuses', 'statuses.adoptionState'] }
    );

    return res.status(201).json({ message: 'adoption created', data: created });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// ===========================
// LISTA: SHELTER por ANIMAL
// ===========================
async function findShelterByAnimal(req: Request, res: Response) {
  try {
    const animalId = Number(req.params.animalId);
    if (Number.isNaN(animalId)) return res.status(400).json({ message: 'animalId inválido' });

    const shelterId = Number((req as any).user?.shelterId);
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const adoptions = await em.find(
      Adoption,
      {
        animal: {
          id: animalId,
          rescueClass: { shelters: shelterId as any },
        } as any,
      },
      {
        populate: ['animal', 'animal.photos', 'person', 'statuses', 'statuses.adoptionState'],
        orderBy: { adoption_date: 'DESC' as any },
      }
    );

    const data = adoptions.map(toShelterListDto);
    return res.status(200).json({ message: 'adoptions for animal', data });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error?.message ?? 'Internal error' });
  }
}

// ===========================
// UPDATE (no cambia)
// ===========================
async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const input = req.body.sanitizedAdoption;
    const adoption = em.getReference(Adoption, id);
    em.assign(adoption, input);
    await em.flush();

    res.status(200).json({ message: 'adoption updated', data: adoption });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// ===========================
// SOFT DELETE: USER + STATUS CANCELADO
// ===========================
async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const personId = Number((req as any).user?.personId);
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const adoption = await em.findOne(
      Adoption,
      { id, deleted_at: null as any },
      { populate: ['person', 'statuses', 'statuses.adoptionState'] }
    );

    if (!adoption) return res.status(404).json({ message: 'Solicitud no encontrada' });

    if ((adoption as any).person?.id !== personId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // 1) marcar baja lógica
    (adoption as any).deleted_at = new Date();

    // 2) crear status CANCELADO (si existe el AdoptionState)
    const cancelState =
      (await em.findOne(AdoptionState, { type: 'CANCELADO' })) ??
      (await em.findOne(AdoptionState, { type: 'cancelado' }));

    if (!cancelState) {
      // si no existe precargado, devolvemos error claro
      return res.status(500).json({ message: 'No existe AdoptionState CANCELADO precargado' });
    }

    const cancelStatus = em.create(AdoptionStatus, {
      statusChangeDate: new Date(),
      reason: 'Cancelada por el solicitante',
      adoption,
      adoptionState: cancelState,
    });

    await em.persistAndFlush(cancelStatus);
    await em.flush();

    return res.status(200).json({ message: 'adoption soft-deleted', data: { id } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  findMine,
  findForShelter,
  findOneForShelter,
  findShelterByAnimal,
  sanitizeAdoptionInput,
};