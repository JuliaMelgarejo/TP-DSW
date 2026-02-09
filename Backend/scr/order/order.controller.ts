// order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Order } from './order.entity.js';
import { LineItemOrder } from '../line_item_order/line_item_order.entity.js';

const em = orm.em;

// ---------- SANITIZE ----------

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrder = {
    fecha: req.body.fecha,
    total: req.body.total,
    id: req.body.id,
  };

  Object.keys(req.body.sanitizedOrder).forEach(key => {
    if (req.body.sanitizedOrder[key] === undefined) {
      delete req.body.sanitizedOrder[key];
    }
  });

  next();
}

function sanitizeLineItemInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedLineItem = {
    cantidad: req.body.cantidad,
    fecha: req.body.fecha,
    subtotal: req.body.subtotal,
    id: req.body.id,
  };

  Object.keys(req.body.sanitizedLineItem).forEach(key => {
    if (req.body.sanitizedLineItem[key] === undefined) {
      delete req.body.sanitizedLineItem[key];
    }
  });

  next();
}

// ---------- CRUD PEDIDO ----------

async function findAll(req: Request, res: Response) {
  try {
    const orders = await em.find(Order, {}, {
      populate: ['items', 'orderStatus', 'person']
    });
    res.status(200).json({ message: 'all orders', data: orders });
  } catch (e:any) {
    res.status(500).json({ message: e.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const order = await em.findOneOrFail(Order, id, {
      populate: ['items', 'orderStatus', 'person']
    });
    res.status(200).json({ message: 'order data', data: order });
  } catch (e:any) {
    res.status(404).json({ message: e.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedOrder;
    const order = em.create(Order, input);
    await em.flush();
    res.status(201).json({ message: 'order created', data: order });
  } catch (e:any) {
    res.status(500).json({ message: e.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const input = req.body.sanitizedOrder;
    const order = em.getReference(Order, id);
    em.assign(order, input);
    await em.flush();
    res.status(200).json({ message: 'order updated', data: order });
  } catch (e:any) {
    res.status(500).json({ message: e.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const order = em.getReference(Order, id);
    await em.removeAndFlush(order);
    res.status(200).json({ message: 'order deleted' });
  } catch (e:any) {
    res.status(500).json({ message: e.message });
  }
}

// ---------- LINE ITEMS (siempre desde Order) ----------

async function addLineItem(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    const order = await em.findOneOrFail(Order, orderId);

    const input = req.body.sanitizedLineItem;
    const item = em.create(LineItemOrder, {
      ...input,
      order
    });

    order.items.add(item);
    order.total += item.subtotal;

    await em.flush();
    res.status(201).json({ message: 'item agregado', data: item });
  } catch (e:any) {
    res.status(400).json({ message: e.message });
  }
}

async function removeLineItem(req: Request, res: Response) {
  try {
    const itemId = Number(req.params.itemId);
    const item = await em.findOneOrFail(LineItemOrder, itemId, {
      populate: ['order']
});

    item.order.total -= item.subtotal;
    await em.removeAndFlush(item);

    res.status(200).json({ message: 'item eliminado' });
  } catch (e:any) {
    res.status(400).json({ message: e.message });
  }
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  addLineItem,
  removeLineItem,
  sanitizeOrderInput,
  sanitizeLineItemInput
};
