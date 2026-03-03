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
      { populate: ['animal', 'animal.rescueClass', 'animal.rescueClass.shelters'] }
    );

    const adoptionShelterId = Number((adoption as any).animal?.rescueClass?.shelters?.id);
    if (adoptionShelterId !== shelterId) {
      return res.status(403).json({ message: 'No autorizado' });
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