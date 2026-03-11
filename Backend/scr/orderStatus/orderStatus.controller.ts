import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from './orderStatus.entity.js';
import { orm } from '../zshare/db/orm.js';
import { OrderState } from '../orderState/orderstate.entity.js';


const em = orm.em

function sanitizeOrderStatusInput(req: Request, res: Response, next:NextFunction){
  
  req.body.sanitizedOrderStatus = {
    statusChangeDate: req.body.statusChangeDate,
    motive: req.body.motive,
    OrderStates: req.body.OrderStates,
    order: req.body.order,
    id: req.body.id,
  }
  if (req.body.sanitizedOrderStatus){
    Object.keys(req.body.sanitizedOrderStatus).forEach((key) => {
      if (req.body.sanitizedOrderStatus[key] === undefined) {
        delete req.body.sanitizedOrderStatus[key]
      }
    })
  }

  next();
}

async function findAll( req: Request, res: Response ){
  try{
    const orderStatus = await em.find(OrderStatus, {populate: ['orderStates', 'order']});
    res.status(200).json({message: 'all orderStatuss: ', data: orderStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const orderStatus = await em.findOneOrFail(OrderStatus, { id: id },{populate: ['orderStates', 'order']});
    res.status(200).json({message: 'orderStatus data: ', data: orderStatus});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedOrderStatus;
    const orderStatus = em.create(OrderStatus, input);
    await em.flush();
    res.status(201).json({ message: 'orderStatus created', data: orderStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedOrderStatus;
    const orderStatus = em.getReference(OrderStatus, id);
    em.assign(orderStatus, input);
    await em.flush();
    res.status(200).json({ message: 'orderStatus updated', data: orderStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const orderStatus = em.getReference(OrderStatus, id);
    em.removeAndFlush(orderStatus);
    res.status(200).json({ message: 'orderStatus deleted', data: orderStatus });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeOrderStatusInput }
