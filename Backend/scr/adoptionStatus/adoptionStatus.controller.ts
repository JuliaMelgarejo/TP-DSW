import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { AdoptionStatus } from '../adoptionStatus/adoptionStatus.entity.js';


const em = orm.em

function sanitizeAdoptionStatusInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoptionStatus = {
    statusChangeDate: req.body.statusChangeDate,
    reason: req.body.reason,
    adoptionStatus: req.body.adoptionStatus,
    id: req.body.id,
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

export { findAll, findOne, add, update, remove, sanitizeAdoptionStatusInput }