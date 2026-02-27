import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Photo } from './photo.entity.js';
import { t } from '@mikro-orm/core';
import path from 'path';
import fs from 'fs';


const em = orm.em

async function findAll( req: Request, res: Response ){
  try {
    const photo = await em.find(Photo, {}, {populate:['animal']})
    res
      .status(200)
      .json({ message: 'found all photo', data: photo })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function findOne( req: Request, res: Response ){
  try {
    const id = Number.parseInt(req.params.id)
    const photo = await em.findOneOrFail(Photo, { id }, {populate:['animal']})
    res
      .status(200)
      .json({ data: photo })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function add(req: Request, res: Response) {
  try {
    const photo = em.create(Photo, req.body)
    await em.flush()
    res
      .status(201)
      .json({ message: 'photo created', data: photo })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const photo = em.getReference(Photo, id)
    em.assign(photo, req.body)
    await em.flush()
    res.status(200).json({ message: 'photo updated' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const photo = em.getReference(Photo, id)
    const url  = photo.url 
    await em.removeAndFlush(photo)
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(200).send({ message: 'animal class deleted' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}


export { findAll, findOne, add, update, remove }