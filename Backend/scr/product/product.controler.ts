import { Request, Response, NextFunction } from 'express';
import { Product } from './product.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeProductInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedProduct = {
    name: req.body.name,
    description: req.body.description,
    stock: req.body.stock,
    deleted_price: req.body.deleted_price,
    lineItemsOrders: req.body.lineItemsOrders,
    prices: req.body.prices,
    category: req.body.category,
    shelter: req.body.shelter,
    photos: req.body.photos,
    id: req.body.id,
  }
  if (req.body.sanitizedProduct){
    Object.keys(req.body.sanitizedProduct).forEach((key) => {
      if (req.body.sanitizedProduct[key] === undefined) {
        delete req.body.sanitizedProduct[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const product = await em.find(Product, {});
    res.status(200).json({message: 'all products: ', data: product});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const product = await em.findOneOrFail(Product, { id: id });
    res.status(200).json({message: 'product data: ', data: product});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedProduct;
    const product = em.create(Product, input);
    await em.flush();
    res.status(201).json({ message: 'product created', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedProduct;
    const product = em.getReference(Product, id);
    em.assign(product, input);
    await em.flush();
    res.status(200).json({ message: 'product updated', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const product = em.getReference(Product, id);
    em.removeAndFlush(product);
    res.status(200).json({ message: 'product deleted', data: product });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeProductInput }
