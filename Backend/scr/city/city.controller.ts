import { Request, Response, NextFunction } from 'express';
import { City } from './city.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeCityInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedCity = {
    nombre: req.body.nombre,
    cod_postal: req.body.cod_postal,
    province: req.body.province,
    people: req.body.people,
    shelters: req.body.shelters,
    rescues: req.body.rescues,
    id: req.body.id,
  }
  if (req.body.sanitizedCity){
    Object.keys(req.body.sanitizedCity).forEach((key) => {
      if (req.body.sanitizedCity[key] === undefined) {
        delete req.body.sanitizedCity[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const city = await em.find(City, {});
    res.status(200).json({message: 'all citys: ', data: city});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const city = await em.findOneOrFail(City, { id: id });
    res.status(200).json({message: 'city data: ', data: city});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedCity;
    const city = em.create(City, input);
    await em.flush();
    res.status(201).json({ message: 'city created', data: city });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedCity;
    const city = em.getReference(City, id);
    em.assign(city, input);
    await em.flush();
    res.status(200).json({ message: 'city updated', data: city });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const city = em.getReference(City, id);
    em.removeAndFlush(city);
    res.status(200).json({ message: 'city deleted', data: city });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findByProvince( req: Request, res: Response ){
  try{
    const province_id = Number.parseInt(req.params.provinceId);
    const cities = await em.find(City, { province: province_id });
    res.status(200).json({message: 'cities by province data: ', data: cities});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}
export { findAll, findOne, add, update, remove, sanitizeCityInput, findByProvince }
