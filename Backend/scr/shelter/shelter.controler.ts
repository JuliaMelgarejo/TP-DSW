import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Shelter } from './shelter.entity.js';

const em = orm.em

async function findAll( req: Request, res: Response ){
  try{
    const { sort, country, province, city, page = 1, limit = 10 } = req.query

    const where: any = {}
    const orderBy: any = {}

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    
    if (country || province ||city){
      where.address = {}
    }

    if (country) {
      where.address.country = country
    }

    if (province) {
      where.address.province = province
    }

    if (city) {
      where.address.city = city
    }

    const [shelters, total] = await em.findAndCount(Shelter, where, {
      populate: ['rescues', 'address'],
      orderBy,
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber
    })

    res.status(200).json({
      message: 'Found shelters',
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      limit: limitNumber,
      data: shelters 
    });
  } catch (error: any){
    return res.status(500).json({message: error.message});
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
    const user = (req as any).user;
    // Validacion de ownership
    if(user.role === 'SHELTER' && user.shelterId !== id){
      return res.status(403).json({
        message: 'No puede modificar otro refugio'
      })
    }

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
    const user = (req as any).user;
    // Validacion de ownership
    if(user.role === 'SHELTER' && user.shelterId !== id){
      return res.status(403).json({
        message: 'No puede eliminar otro refugio'
      })
    }
    const shelter = em.getReference(Shelter, id)
    await em.removeAndFlush(shelter)
    res.status(200).send({ message: 'character class deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findByBoundary(req: Request, res: Response) {
  try {
    const { nort, south, east, west, userLat, userLng } = req.query;

    const isUserInsideMap = Number(userLat) >= Number(south) && Number(userLat) <= Number(nort) && Number(userLng) >= Number(west) && Number(userLng) <= Number(east);

    let filteredShelters: Shelter[] | any[];

    if (isUserInsideMap){
      const shelters = await em.getConnection().execute(`
        SELECT 
          s.*,
          a.id as address_id,
          a.latitude,
          a.longitude,
          ROUND(ST_Distance_Sphere(point(a.longitude, a.latitude), point(?, ?)) / 1000, 2) AS distance
        FROM shelter s
        JOIN address a ON s.address_id = a.id
        WHERE 
          a.latitude BETWEEN ? AND ?
          AND a.longitude BETWEEN ? AND ?
        HAVING distance < ?
        ORDER BY distance ASC
      `, [
        Number(userLng),
        Number(userLat),
        Number(south),
        Number(nort),
        Number(west),
        Number(east),
        10
      ]);

      filteredShelters = shelters.map((s: any) => ({
        ...s,
        distance: Number(s.distance),
        address: {
          id: s.address_id,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude)
        }
      }));
    } else {
      filteredShelters = await em.find(Shelter, {
        address: {
          latitude: { $gte: Number(south), $lte: Number(nort) },
          longitude: { $gte: Number(west), $lte: Number(east) }
        }
      }, { populate: ['address'] });
    }

    res.status(200).json({
      message: 'Shelters found',
      isUserInsideMap,
      data: filteredShelters
    });

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
