import { Request, Response, NextFunction } from 'express';
import { ShippingTypeState } from './shippingTypeState.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeShippingTypeStateInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedShippingTypeState = {
    name: req.body.name,
    shippingTypeStatus: req.body.shippingTypeStatus,
    id: req.body.id,
  }
  if (req.body.sanitizedShippingTypeState){
    Object.keys(req.body.sanitizedShippingTypeState).forEach((key) => {
      if (req.body.sanitizedShippingTypeState[key] === undefined) {
        delete req.body.sanitizedShippingTypeState[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const shippingTypeState = await em.find(ShippingTypeState, {});
    res.status(200).json({message: 'all shippingTypeStates: ', data: shippingTypeState});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const shippingTypeState = await em.findOneOrFail(ShippingTypeState, { id: id });
    res.status(200).json({message: 'shippingTypeState data: ', data: shippingTypeState});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedShippingTypeState;
    const shippingTypeState = em.create(ShippingTypeState, input);
    await em.flush();
    res.status(201).json({ message: 'shippingTypeState created', data: shippingTypeState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedShippingTypeState;
    const shippingTypeState = em.getReference(ShippingTypeState, id);
    em.assign(shippingTypeState, input);
    await em.flush();
    res.status(200).json({ message: 'shippingTypeState updated', data: shippingTypeState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const shippingTypeState = em.getReference(ShippingTypeState, id);
    em.removeAndFlush(shippingTypeState);
    res.status(200).json({ message: 'shippingTypeState deleted', data: shippingTypeState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeShippingTypeStateInput }
