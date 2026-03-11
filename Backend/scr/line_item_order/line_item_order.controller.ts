import { Request, Response } from 'express';
import { orm } from '../zshare/db/orm.js';
import { LineItemOrder } from './line_item_order.entity.js';

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const items = await em.find(LineItemOrder, {}, {
      populate: ['order']
    });
    res.status(200).json({ message: 'all items', data: items });
  } catch (e:any) {
    res.status(500).json({ message: e.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const item = await em.findOneOrFail(LineItemOrder, id, {
      populate: ['order']
    });
    res.status(200).json({ message: 'item data', data: item });
  } catch (e:any) {
    res.status(404).json({ message: e.message });
  }
}

export { findAll, findOne };
