// order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Order } from './order.entity.js';
import { LineItemOrder } from '../line_item_order/line_item_order.entity.js';
import { Product } from '../product/product.entity.js';
import { Person } from '../person/person.entity.js';

const em = orm.em;

// ---------- SANITIZE ----------

function sanitizeOrderInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedOrder = {
    fecha: req.body.fecha,
    total: req.body.total,
    product: req.body.product,
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
      order,
      product: em.getReference(Product, input.product),
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


async function checkout(req: Request, res: Response) {
  try {
    const personId = Number((req as any).user?.personId);
    if (!personId) return res.status(401).json({ message: 'Token sin personId' });

    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items requeridos' });
    }

    // traer productos con precio activo (vos ya usás endDate null)
    const productIds = items.map((i: any) => Number(i.productId));
    const products = await em.find(
      Product,
      { id: { $in: productIds } as any },
      {
        populate: ['prices'],
        populateWhere: { prices: { endDate: null } },
      } as any
    );

    const productMap = new Map<number, any>();
    for (const p of products) productMap.set(p.id as number, p);

    // validar y calcular
    let total = 0;

    const order = em.create(Order, {
      fecha: new Date(),
      total: 0,
      person: em.getReference(Person, personId),
    });

    for (const i of items) {
      const productId = Number(i.productId);
      const qty = Number(i.qty);

      if (!productId || !qty || qty <= 0) {
        return res.status(400).json({ message: 'Item inválido' });
      }

      const product = productMap.get(productId);
      if (!product) return res.status(404).json({ message: `Producto ${productId} no existe` });

      const activePrice = product.prices?.[0];
      if (!activePrice) return res.status(400).json({ message: `Producto ${productId} sin precio activo` });

      if (product.stock < qty) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
      }

      const subtotal = activePrice.amount * qty;
      total += subtotal;

      const li = em.create(LineItemOrder, {
        cantidad: qty,
        fecha: new Date(),
        subtotal,
        order,
        product: em.getReference(Product, productId),
      });

      order.items.add(li);
    }

    order.total = total;

    await em.persistAndFlush(order);

    // devolver orden completa
    const created = await em.findOneOrFail(
      Order,
      { id: order.id },
      { populate: ['items', 'items.product', 'person'] } as any
    );

    return res.status(201).json({ message: 'order created', data: created });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
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
  sanitizeLineItemInput,
  checkout
};
