import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { AdoptionStatus } from '../adoptionStatus/adoptionStatus.entity.js';
import { AdoptionState } from '../adoptionState/adoptionState.entity.js';
import { Adoption } from '../adoption/adoption.entity.js';


const em = orm.em

function sanitizeAdoptionStatusInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoptionStatus = {
    reason: req.body.reason,
    adoptionStatus: req.body.adoptionStatus,
  }
  if (req.body.sanitizedAdoptionStatus){
    Object.keys(req.body.sanitizedAdoptionStatus).forEach((key) => {
      if (req.body.sanitizedAdoptionStatus[key] === undefined) {
        delete req.body.sanitizedAdoptionStat[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const adoptionStatus = await em.find(AdoptionStatus, {} ,{populate:['adoption', 'adoptionState']});
    res.status(200).json({message: 'all adoptionStatus: ', data: adoptionStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const adoptionStatus = await em.findOneOrFail(AdoptionStatus, { id: id }, {populate:['adoption', 'adoptionState']});
    res.status(200).json({message: 'adoptionStatus data: ', data: adoptionStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedAdoptionStatus;
    const adoptionStatus = em.create(AdoptionStatus, input);
    await em.flush();
    res.status(201).json({ message: 'adoptionStatus created', data: adoptionStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function addStatusForShelter(req: Request, res: Response) {
  try {
    const adoptionId = Number(req.params.id);
    if (Number.isNaN(adoptionId)) {
      return res.status(400).json({ message: 'ID de adopción inválido' });
    }

    const shelterId = Number((req as any).user?.shelterId);
    if (!shelterId) {
      return res.status(401).json({ message: 'Token sin shelterId' });
    }

    const stateTypeRaw = req.body?.stateType;
    const reason = req.body?.reason ?? '';

    if (!stateTypeRaw) {
      return res.status(400).json({ message: 'stateType es requerido' });
    }

    const stateType = String(stateTypeRaw).trim().toUpperCase();

    const adoption = await em.findOneOrFail(
      Adoption,
      { id: adoptionId },
      { populate: ['animal', 'animal.rescueClass', 'animal.rescueClass.shelters', 'statuses', 'statuses.adoptionState'] }
    );

    const adoptionShelterId = Number((adoption as any).animal?.rescueClass?.shelters?.id);
    if (adoptionShelterId !== shelterId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

        // si está soft deleted → no se puede cambiar
    if ((adoption as any).deleted_at) {
      return res.status(409).json({ message: 'La solicitud está CANCELADA. No se puede modificar.' });
    }

    // si el último estado es CANCELADO → no se puede cambiar
    const statuses = (adoption as any).statuses?.getItems ? (adoption as any).statuses.getItems() : ((adoption as any).statuses ?? []);
    const latest = [...statuses].sort(
      (x: any, y: any) => new Date(y?.statusChangeDate ?? 0).getTime() - new Date(x?.statusChangeDate ?? 0).getTime()
    )[0];

    if (latest?.adoptionState?.type?.toUpperCase() === 'CANCELADO') {
      return res.status(409).json({ message: 'La solicitud está CANCELADA. No se puede modificar.' });
    }

    const state = await em.findOne(AdoptionState, { type: stateType });
    if (!state) {
      return res.status(400).json({ message: `Estado '${stateType}' no existe` });
    }

    const status = em.create(AdoptionStatus, {
      statusChangeDate: new Date(),
      reason: String(reason),
      adoption: em.getReference(Adoption, adoptionId),
      adoptionState: state, // ✅ sin state.id
    });

    await em.persistAndFlush(status);

    return res.status(201).json({ message: 'adoptionStatus created', data: status });
  } catch (error: any) {
    console.error('addStatusForShelter ERROR:', error);
    return res.status(500).json({ message: error?.message ?? 'Internal error' });
  }
}
async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedAdoptionStatus;
    const adoptionStatus = em.getReference(AdoptionStatus, id);
    em.assign(adoptionStatus, input);
    await em.flush();
    res.status(200).json({ message: 'adoptionStatus updated', data: adoptionStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const adoptionStatus = em.getReference(AdoptionStatus, id);
    em.removeAndFlush(adoptionStatus);
    res.status(200).json({ message: 'adoption deleted', data: adoptionStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, addStatusForShelter, sanitizeAdoptionStatusInput }