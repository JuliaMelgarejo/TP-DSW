import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Province } from './province.entity.js';


const em = orm.em

function sanitizeProvinceInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedAdoption = {
    name: req.body.name,
    country: req.body.country,
    cities: req.body.cities,
  }
  if (req.body.sanitizedProvince){
    Object.keys(req.body.sanitizedProvince).forEach((key) => {
      if (req.body.sanitizedProvince[key] === undefined) {
        delete req.body.sanitizedProvince[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const province = await em.find(Province, {});
    res.status(200).json({message: 'all adoptions: ', data: province});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const province = await em.findOneOrFail(Province, { id: id });
    res.status(200).json({message: 'adoption data: ', data: province});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedAdoption;
    const province = em.create(Province, input);
    await em.flush();
    res.status(201).json({ message: 'adoption created', data: province });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedProvince;
    const province = em.getReference(Province, id);
    em.assign(province, input);
    await em.flush();
    res.status(200).json({ message: 'adoption updated', data: province });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const province = em.getReference(Province, id);
    em.removeAndFlush(province);
    res.status(200).json({ message: 'province deleted', data: province });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findByCountry( req: Request, res: Response ){
  try{
    const country_id = Number.parseInt(req.params.countryId);
    const provinces = await em.find(Province, { country: country_id });
    res.status(200).json({message: 'provinces by country data: ', data: provinces});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

export { findAll, findOne, add, update, remove, sanitizeProvinceInput, findByCountry }
