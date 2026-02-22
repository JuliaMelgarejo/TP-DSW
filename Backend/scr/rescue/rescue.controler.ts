import { NextFunction, Request, Response } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Rescue } from './rescue.entity.js';

const em = orm.em

function sanitizeRescueInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedRescue = {
    comments: req.body.comments,
    animal: req.body.animal,
    person: req.body.person,
    adoption_date: req.body.adoption_date,
    id: req.body.id,
  }
  if (req.body.sanitizedRescue){
    Object.keys(req.body.sanitizedRescue).forEach((key) => {
      if (req.body.sanitizedRescue[key] === undefined) {
        delete req.body.sanitizedRescue[key]
      }
    })
  }

  next();
}
async function findAll( req: Request, res: Response ){
  try{
    const rescue = await em.find(Rescue, {}, {populate:['shelters', 'city', 'animals']});
    res.status(200).json({message: 'all rescues: ', data: rescue});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try {
    const id = Number.parseInt(req.params.id)
    const rescue = await em.findOneOrFail(Rescue, { id })
    res
      .status(200)
      .json({ message: 'found character class', data: rescue })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedRescue;
    const rescue = em.create(Rescue, req.body)
    await em.flush()
    res.status(201).json({ message: 'rescue created', data: rescue })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const input = req.body.sanitizedRescue;
    const rescue = em.getReference(Rescue, id)
    em.assign(rescue, req.body)
    await em.flush()
    res.status(200).json({ message: 'rescue updated' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const rescue = em.getReference(Rescue, id)
    await em.removeAndFlush(rescue)
    res.status(200).send({ message: 'rescue deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeRescueInput }