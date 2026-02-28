import { NextFunction, Request, Response } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Rescue } from './rescue.entity.js';
import { City } from '../city/city.entity.js';
import { Shelter } from '../shelter/shelter.entity.js';
import { Animal } from '../animal/animal.entity.js';
import { Breed } from '../breed/breed.entity.js';

const em = orm.em

function sanitizeRescueInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedRescue = {
    rescue_date: req.body.rescue_date,
    description: req.body.description,
    comments: req.body.comments,
    street: req.body.street,
    number_street: req.body.number_street,
    animal: req.body.animal,
    shelters: req.body.shelters,
    city: req.body.city,
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
    const result = await em.transactional(async (trx) => {
      const rescue = trx.create(Rescue, {
        rescue_date: new Date(req.body.rescue_date),
        description: req.body.description ?? '',
        comments: req.body.comments ?? '',
        street: req.body.street,
        number_street: Number(req.body.number_street),
        city: trx.getReference(City, Number(req.body.city)),
        shelters: trx.getReference(Shelter, Number(req.body.shelters)),
      });

    const animalsPayload = Array.isArray(req.body.animals) ? req.body.animals : [];
      for (const a of animalsPayload) {
        const animal = trx.create(Animal, {
          name: a.name,
          birth_date: a.birth_date ? new Date(a.birth_date) : null,
          description: a.description ?? '',
          breed: trx.getReference(Breed, Number(a.breed)),
          rescueClass: rescue, // ✅ clave
        });

        rescue.animals.add(animal); // ✅ también lo agregamos al collection
      }
    
    await trx.flush()
    await trx.populate(rescue, ['animals','animals.breed' ,'shelters', 'city'])
    return rescue
    })
    res.status(201).json({ message: 'rescue created', data: result })
  } catch (error: any) {
    console.log('RESCUE CREATE ERROR =>', error);
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