import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Address } from './address.entity.js';

const em = orm.em

async function findAllShelters( req: Request, res: Response ){
  try{
    const address = await em.find(Address, {});
    res.status(200).json({message: 'address data: ', data: address});
  }
  catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function findOne( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const address = await em.findOneOrFail(Address, { id: id });
    res.status(200).json({message: 'address data: ', data: address});
  } catch (error: any){
    res.status(500).json({message: error.message});
  }
}

async function add( req: Request, res: Response ){
  try{
    const input = req.body.sanitizedAddress;
    const address = em.create(Address, input);
    await em.flush();
    res.status(201).json({ message: 'address created', data: address });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedAddress;
    const address = em.getReference(Address, id);
    em.assign(address, input);
    await em.flush();
    res.status(200).json({ message: 'address updated', data: address });
  }catch (error: any) {
    console.log('Error updating address: ', error);
    res.status(500).json({ message: error.message })
  }
}

async function remove( req: Request, res: Response ){
  try{
    const id = Number.parseInt(req.params.id);
    const address = em.getReference(Address, id);
    em.removeAndFlush(address);
    res.status(200).json({ message: 'address deleted', data: address });
  }catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

function sanitizeAddressInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedAddress = {
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  };

  if (req.body.sanitizedAddress) {
    Object.keys(req.body.sanitizedAddress).forEach((key) => {
      if (req.body.sanitizedAddress[key] === undefined) {
        delete req.body.sanitizedAddress[key];
      }
    });
  }

  next();
}

export { findOne, add, update, remove, findAllShelters, sanitizeAddressInput }
