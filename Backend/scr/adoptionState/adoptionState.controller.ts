import { Request, Response, NextFunction } from 'express';
import { AdoptionState } from './adoptionState.entity.js';
import { orm } from '../zshare/db/orm.js';
import { AdoptionStatus } from '../adoptionStatus/adoptionStatus.entity.js';


const em = orm.em

function sanitizeAdoptionStateInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoptionState = {
    type: req.body.type,
    desciption: req.body.description,
    adoptionStatus: req.body.adoptionStatus,
    id: req.body.id,
  }
  if (req.body.sanitizedAdoptionState){
    Object.keys(req.body.sanitizedAdoptionState).forEach((key) => {
      if (req.body.sanitizedAdoptionState[key] === undefined) {
        delete req.body.sanitizedAdoptionState[key]
      }
    })
  }

  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role ?? '').toUpperCase();

    // Si es shelter, no devolver CANCELADO
    const where =
      role === 'SHELTER'
        ? ({ type: { $ne: 'CANCELADO' } } as any)
        : ({} as any);

    const adoptionState = await em.find(AdoptionState, where, {
      orderBy: { type: 'ASC' as any },
    });

    res.status(200).json({ message: 'all adoptionStates', data: adoptionState });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const adoptionState = await em.findOneOrFail(AdoptionState, { id: id });
    res.status(200).json({message: 'adoptionState data: ', data: adoptionState});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedAdoptionState;
    const adoptionState = em.create(AdoptionState, input);
    await em.flush();
    res.status(201).json({ message: 'adoptionState created', data: adoptionState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedAdoptionState;
    const adoptionState = em.getReference(AdoptionState, id);
    em.assign(adoptionState, input);
    await em.flush();
    res.status(200).json({ message: 'adoption updated', data: adoptionState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const adoptionState = em.getReference(AdoptionState, id);
    em.removeAndFlush(adoptionState);
    res.status(200).json({ message: 'adoption deleted', data: adoptionState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeAdoptionStateInput }