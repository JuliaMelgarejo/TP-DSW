import { Request, Response, NextFunction } from 'express';
import { Category } from './productCategory.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeCategoryInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedCategory = {
    name: req.body.name,
    description: req.body.description,
    product: req.body.product,
    id: req.body.id,
  }
  if (req.body.sanitizedCategory){
    Object.keys(req.body.sanitizedCategory).forEach((key) => {
      if (req.body.sanitizedCategory[key] === undefined) {
        delete req.body.sanitizedCategory[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const category = await em.find(Category, {});
    res.status(200).json({message: 'all categorys: ', data: category});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const category = await em.findOneOrFail(Category, { id: id });
    res.status(200).json({message: 'category data: ', data: category});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedCategory;
    const category = em.create(Category, input);
    await em.flush();
    res.status(201).json({ message: 'category created', data: category });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedCategory;
    const category = em.getReference(Category, id);
    em.assign(category, input);
    await em.flush();
    res.status(200).json({ message: 'category updated', data: category });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const category = em.getReference(Category, id);
    em.removeAndFlush(category);
    res.status(200).json({ message: 'category deleted', data: category });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeCategoryInput }
