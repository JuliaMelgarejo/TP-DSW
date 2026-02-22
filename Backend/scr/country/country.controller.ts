import { Request, Response, NextFunction } from 'express';
import { Country } from './country.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeCountryInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoption = {
    name: req.body.name,
    provinces: req.body.provinces
  }
  if (req.body.sanitizedCountry){
    Object.keys(req.body.sanitizedCountry).forEach((key) => {
      if (req.body.sanitizedCountry[key] === undefined) {
        delete req.body.sanitizedCountry[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const country = await em.find(Country, {});
    res.status(200).json({message: 'all countries: ', data: country});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const country = await em.findOneOrFail(Country, { id: id });
    res.status(200).json({message: 'country data: ', data: country});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedCountry;
    const country = em.create(Country, input);
    await em.flush();
    res.status(201).json({ message: 'country created', data: country });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedCountry;
    const country = em.getReference(Country, id);
    em.assign(country, input);
    await em.flush();
    res.status(200).json({ message: 'country updated', data: country });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const country = em.getReference(Country, id);
    em.removeAndFlush(country);
    res.status(200).json({ message: 'country deleted', data: country });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeCountryInput }