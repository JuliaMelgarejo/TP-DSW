import { Request, Response, NextFunction } from 'express';
import { Price } from './price.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizePriceInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedPrice = {
    date: req.body.date,
    value: req.body.value,
    product: req.body.product,
    id: req.body.id,
  }
  if (req.body.sanitizedPrice){
    Object.keys(req.body.sanitizedPrice).forEach((key) => {
      if (req.body.sanitizedPrice[key] === undefined) {
        delete req.body.sanitizedPrice[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const price = await em.find(Price, {});
    res.status(200).json({message: 'all prices: ', data: price});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const price = await em.findOneOrFail(Price, { id: id });
    res.status(200).json({message: 'price data: ', data: price});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedPrice;
    const price = em.create(Price, input);
    await em.flush();
    res.status(201).json({ message: 'price created', data: price });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedPrice;
    const price = em.getReference(Price, id);
    em.assign(price, input);
    await em.flush();
    res.status(200).json({ message: 'price updated', data: price });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const price = em.getReference(Price, id);
    em.removeAndFlush(price);
    res.status(200).json({ message: 'price deleted', data: price });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizePriceInput }
