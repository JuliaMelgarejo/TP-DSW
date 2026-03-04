import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';

import { Adoption } from './adoption.entity.js';
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

async function getState(type: string) {
  return (
    (await em.findOne(AdoptionState, { type })) ??
    (await em.findOne(AdoptionState, { type: type.toLowerCase() }))
  );
}

// ===========================
// ADMIN / DEBUG (si lo querés)
// ===========================
async function findAll(req: Request, res: Response) {
  try {
    const adoptions = await em.find(Adoption, {}, { populate: ['animal', 'person'] });
    return res.status(200).json({ message: 'all adoptions', data: adoptions });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// USER: LISTA "MIS ADOPCIONES" (no ve eliminadas)
// ===========================
async function findMine(req: Request, res: Response) {
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
    return res.status(200).json({ message: 'my adoptions', data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// SHELTER: LISTA "ADOPCIONES DE MI REFUGIO" (ve eliminadas)
// ===========================
async function findForShelter(req: Request, res: Response) {
  try {
    const shelterId = Number((req as any).user?.shelterId);
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const adoptions = await em.find(
      Adoption,
      { animal: { rescueClass: { shelters: shelterId as any } } } as any, // <-- si es singular: shelter
      {
        populate: [
          'animal',
          'animal.photos',
          'animal.rescueClass',
          'animal.rescueClass.shelters', // <-- si es singular: shelter
          'person',
          'statuses',
          'statuses.adoptionState',
        ],
        orderBy: { adoption_date: 'DESC' as any },
      }
    );

    const data = adoptions.map(toShelterListDto);
    return res.status(200).json({ message: 'shelter adoptions', data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// SHELTER: DETALLE (usa shelterAdoptionGuard)
// El guard deja req.adoption ya autorizado
// ===========================
async function findOneForShelter(req: Request, res: Response) {
  try {
    const adoption = (req as any).adoption;
    if (!adoption) return res.status(500).json({ message: 'Guard no cargó adoption' });

    return res.status(200).json({ message: 'adoption detail for shelter', data: adoption });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// SHELTER: LISTA POR ANIMAL (usa shelterAnimalGuard)
// ===========================
async function findShelterByAnimal(req: Request, res: Response) {
  try {
    const animalId = Number(req.params.animalId);
    if (!animalId) return res.status(400).json({ message: 'animalId inválido' });

    // shelterAnimalGuard ya validó pertenencia del animal
    const adoptions = await em.find(
      Adoption,
      { animal: animalId as any } as any,
      {
        populate: ['animal', 'animal.photos', 'person', 'statuses', 'statuses.adoptionState'],
        orderBy: { adoption_date: 'DESC' as any },
      }
    );

    const data = adoptions.map(toShelterListDto);
    return res.status(200).json({ message: 'adoptions for animal', data });
  } catch (error: any) {
    return res.status(500).json({ message: error?.message ?? 'Internal error' });
  }
}

// ===========================
// USER: CREAR SOLICITUD (PENDIENTE)
// ===========================
async function add(req: Request, res: Response) {
  try {
    const animalId = Number.parseInt(req.params.animalId);
    const personId = Number((req as any).user?.personId);

    if (!animalId) return res.status(400).json({ message: 'animalId inválido' });
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

    const pendingState = await getState('PENDIENTE');
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
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// USER: UPDATE (solo comments, y solo si es del user y no está eliminada)
// ===========================
async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID inválido' });

    const personId = Number((req as any).user?.personId);
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const input = req.body.sanitizedAdoption ?? {};

    const adoption = await em.findOne(
      Adoption,
      { id, deleted_at: null as any },
      { populate: ['person'] }
    );

    if (!adoption) return res.status(404).json({ message: 'Solicitud no encontrada' });

    if ((adoption as any).person?.id !== personId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    em.assign(adoption, { comments: input.comments });
    await em.flush();

    return res.status(200).json({ message: 'adoption updated', data: adoption });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// USER: SOFT DELETE + STATUS CANCELADO
// ===========================
async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'ID inválido' });

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

    (adoption as any).deleted_at = new Date();

    const cancelState = await getState('CANCELADO');
    if (!cancelState) {
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
    return res.status(500).json({ message: error.message });
  }
}

export {
  findAll,
  findMine,
  findForShelter,
  findOneForShelter,
  findShelterByAnimal,
  add,
  update,
  remove,
  sanitizeAdoptionInput,
};