import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Shelter } from './shelter.entity.js';

const em = orm.em

async function findAll( req: Request, res: Response ){
  try{
    const shelter = await em.find(Shelter, {}, {populate:['rescues', 'vet', 'address']});
    res.status(200).json({message: 'all shelters: ', data: shelter });
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try {
    const id = Number.parseInt(req.params.id)
    const shelter = await em.findOneOrFail(Shelter, { id }, {populate:['rescues', 'vet', 'address']})
    res
      .status(200)
      .json({ message: 'found shelter', data: shelter })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add(req: Request, res: Response) {
  try {
    const shelter = em.create(Shelter, req.body.sanitizedShelter)
    await em.flush()
    res.status(201).json({ message: 'Shelter created', data: shelter })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const shelter = await em.findOneOrFail(Shelter, id, { populate: ['address'] })

    const data = req.body.sanitizedShelter

    em.assign(shelter, {
      name: data.name,
      phoneNumber: data.phoneNumber,
      tuitionVet: data.tuitionVet,
      max_capacity: data.max_capacity,
    })

    if (data.address && shelter.address) {
      em.assign(shelter.address, data.address)
    }

    await em.flush()
    res.status(200).json({ message: 'shelter updated' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const shelter = em.getReference(Shelter, id)
    await em.removeAndFlush(shelter)
    res.status(200).send({ message: 'character class deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findByBoundary(req: Request, res: Response) {
  try {
    const { nort, south, east, west } = req.query;
    console.log('Received query parameters:', req.query);
    console.log('Received boundaries:', { nort, south, east, west });

    const shelters = await em.find(Shelter, {
      address: {
        latitude: { $gte: Number(south), $lte: Number(nort) },
        longitude: { $gte: Number(west), $lte: Number(east) }
      }
    }, { populate: ['address'] });

    console.log('shelters: ', shelters)

    res.status(200).json({ message: 'Shelters found', data: shelters });
  } catch (error: any) {
    res.status(500).json({ message: error.message }); 
  }
}

function sanitizeShelterInput(req: Request, res: Response, next:NextFunction){
  req.body.sanitizedShelter = {
    name: req.body.name,
    tuitionVet: req.body.tuitionVet,
    phoneNumber: req.body.phoneNumber,
    max_capacity: req.body.max_capacity,
    rescues: req.body.rescues,
    address: req.body.address ? {
      latitude: req.body.address.latitude,
      longitude: req.body.address.longitude,
      formattedAddress: req.body.address.formattedAddress,
      placeId: req.body.address.placeId,
      street: req.body.address.street,
      streetNumber: req.body.address.streetNumber,
      city: req.body.address.city,
      postalCode: req.body.address.postalCode,
      province: req.body.address.province,
      country: req.body.address.country,
    } : undefined
  }
    Object.keys(req.body.sanitizedShelter).forEach((key) => {
    if (req.body.sanitizedShelter[key] === undefined) {
      delete req.body.sanitizedShelter[key]
    }
  })

  next()
}

export { findAll, findOne, add, update, remove, sanitizeShelterInput, findByBoundary }
