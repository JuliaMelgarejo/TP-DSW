import { Request, Response, NextFunction } from 'express';
import { Adoption } from './adoption.entity.js';
import { orm } from '../zshare/db/orm.js';
import { Animal } from '../animal/animal.entity.js';
import { Person } from '../person/person.entity.js';
import { AdoptionState } from '../adoptionState/adoptionState.entity.js';
import { AdoptionStatus } from '../adoptionStatus/adoptionStatus.entity.js';


const em = orm.em

function sanitizeAdoptionInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoption = {
    comments: req.body.comments,
  }
  if (req.body.sanitizedAdoption){
    Object.keys(req.body.sanitizedAdoption).forEach((key) => {
      if (req.body.sanitizedAdoption[key] === undefined) {
        delete req.body.sanitizedAdoption[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const adoption = await em.find(Adoption, {});
    res.status(200).json({message: 'all adoptions: ', data: adoption});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }   
    const adoption = await em.findOneOrFail(
      Adoption,
      { id },
      { populate: ['animal', 'animal.photos', 'statuses', 'statuses.adoptionState'] }
    );
    res.status(200).json({message: 'adoption data: ', data: adoption});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findMine(req: Request, res: Response) {
  try {
    const personId = Number((req as any).user?.personId);
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const adoptions = await em.find(
      Adoption,
      { person: personId as any },
      { populate: ['animal', 'animal.photos', 'statuses', 'statuses.adoptionState'], orderBy: { adoption_date: 'DESC' } }
    );

    // ✅ devolvemos “estado actual” ya calculado (para que el front sea fácil)
    const data = adoptions.map((a: any) => {
      const statuses = a.statuses?.getItems ? a.statuses.getItems() : (a.statuses ?? []);
      const latest = [...statuses].sort((x: any, y: any) =>
        new Date(y.statusChangeDate).getTime() - new Date(x.statusChangeDate).getTime()
      )[0];

      return {
        id: a.id,
        adoption_date: a.adoption_date,
        comments: a.comments,
        animal: {
          id: a.animal?.id,
          name: a.animal?.name,
          photos: a.animal?.photos ?? [],
        },
        currentState: latest?.adoptionState?.type ?? 'PENDIENTE',
      };
    });

    res.status(200).json({ message: 'my adoptions', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const animalId = Number.parseInt(req.params.animalId);
    const personId = Number((req as any).user?.personId);

    if (!animalId) return res.status(400).json({ message: 'animalId inválido' });
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const input = req.body.sanitizedAdoption; 

    const existing = await em.findOne(Adoption, {
      animal: animalId as any,
      person: personId as any,
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
    const pendingState = await em.findOne(AdoptionState, { type: 'PENDIENTE' });
    if (!pendingState) {
      return res.status(500).json({ message: 'No existe AdoptionState PENDIENTE precargado' });
    }

    const status = em.create(AdoptionStatus, {
      statusChangeDate: new Date(),
      reason: 'Solicitud creada',
      adoption,
      adoptionState: pendingState,
    });

    adoption.statuses.add(status);

    await em.persistAndFlush(adoption);   

    return res.status(201).json({ message: 'adoption created', data: adoption });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const input = req.body.sanitizedAdoption;
    const adoption = em.getReference(Adoption, id);
    em.assign(adoption, input);
    await em.flush();
    res.status(200).json({ message: 'adoption updated', data: adoption });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });
    const adoption = em.getReference(Adoption, id);
    em.removeAndFlush(adoption);
    res.status(200).json({ message: 'adoption deleted', data: adoption });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove,findMine , sanitizeAdoptionInput }
