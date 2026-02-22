import { Request, Response, NextFunction } from 'express';
import { ShippingTypeStatus } from './shippingTypeStatus.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeShippingTypeStatusInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedShippingTypeStatus = {
    amount: req.body.amount,
    anable: req.body.anable,
    shelter: req.body.shelter,
    shippingTypeState: req.body.shippingTypeState,
    id: req.body.id,
  }
  if (req.body.sanitizedShippingTypeStatus){
    Object.keys(req.body.sanitizedShippingTypeStatus).forEach((key) => {
      if (req.body.sanitizedShippingTypeStatus[key] === undefined) {
        delete req.body.sanitizedShippingTypeStatus[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const shippingTypeStatus = await em.find(ShippingTypeStatus, {});
    res.status(200).json({message: 'all shippingTypeStatuss: ', data: shippingTypeStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const shippingTypeStatus = await em.findOneOrFail(ShippingTypeStatus, { id: id });
    res.status(200).json({message: 'shippingTypeStatus data: ', data: shippingTypeStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedShippingTypeStatus;
    const shippingTypeStatus = em.create(ShippingTypeStatus, input);
    await em.flush();
    res.status(201).json({ message: 'shippingTypeStatus created', data: shippingTypeStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedShippingTypeStatus;
    const shippingTypeStatus = em.getReference(ShippingTypeStatus, id);
    em.assign(shippingTypeStatus, input);
    await em.flush();
    res.status(200).json({ message: 'shippingTypeStatus updated', data: shippingTypeStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const shippingTypeStatus = em.getReference(ShippingTypeStatus, id);
    em.removeAndFlush(shippingTypeStatus);
    res.status(200).json({ message: 'shippingTypeStatus deleted', data: shippingTypeStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeShippingTypeStatusInput }
