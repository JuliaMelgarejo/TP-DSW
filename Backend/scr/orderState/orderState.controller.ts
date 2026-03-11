import { Request, Response, NextFunction } from 'express';
import { OrderState } from './orderstate.entity.js';
import { orm } from '../zshare/db/orm.js';


const em = orm.em

function sanitizeOrderStateInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedOrderState = {
    comments: req.body.comments,
    animal: req.body.animal,
    person: req.body.person,
    orderState_date: req.body.orderState_date,
  }
  if (req.body.sanitizedOrderState){
    Object.keys(req.body.sanitizedOrderState).forEach((key) => {
      if (req.body.sanitizedOrderState[key] === undefined) {
        delete req.body.sanitizedOrderState[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const orderState = await em.find(OrderState, {});
    res.status(200).json({message: 'all orderStates: ', data: orderState});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const orderState = await em.findOneOrFail(OrderState, { id: id });
    res.status(200).json({message: 'orderState data: ', data: orderState});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedOrderState;
    const orderState = em.create(OrderState, input);
    await em.flush();
    res.status(201).json({ message: 'orderState created', data: orderState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedOrderState;
    const orderState = em.getReference(OrderState, id);
    em.assign(orderState, input);
    await em.flush();
    res.status(200).json({ message: 'orderState updated', data: orderState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const orderState = em.getReference(OrderState, id);
    em.removeAndFlush(orderState);
    res.status(200).json({ message: 'orderState deleted', data: orderState });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeOrderStateInput }
