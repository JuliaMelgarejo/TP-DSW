// order.controller.ts
import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Order } from './order.entity.js';
import { LineItemOrder } from '../line_item_order/line_item_order.entity.js';
import { Product } from '../product/product.entity.js';
import { Person } from '../person/person.entity.js';
import { OrderState } from '../orderState/orderstate.entity.js';
import { OrderStatus } from '../orderStatus/orderStatus.entity.js';

const em = orm.em;

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

function getStatusesArray(o: any): any[] {
  if (o?.orderStatus?.getItems) return o.orderStatus.getItems();
  return o?.orderStatus ?? [];
}

function getLatestStateType(o: any): string {
  const statuses = getStatusesArray(o);
  if (!Array.isArray(statuses) || statuses.length === 0) return 'PENDIENTE';

  const latest = [...statuses].sort(
    (a: any, b: any) =>
      new Date(b?.statusChangeDate ?? 0).getTime() - new Date(a?.statusChangeDate ?? 0).getTime()
  )[0];

  return latest?.orderState?.type ?? 'PENDIENTE';
}

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

    const items = req.body?.items as { productId: number; qty: number }[];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items es requerido' });
    }

    // 1) Crear order (sin total por ahora)
    const order = em.create(Order, {
      fecha: new Date(),
      total: 0,
      person: em.getReference(Person, personId),
    });

    let total = 0;

    // 2) Recorrer items: validar stock, calcular subtotal, crear line items, descontar stock
    for (const it of items) {
      const productId = Number(it.productId);
      const qty = Number(it.qty);

      if (!productId || qty <= 0) {
        return res.status(400).json({ message: 'Item inválido' });
      }

      // Traer producto con precio activo
      const product = await em.findOne(
        Product,
        { id: productId },
        { populate: ['prices'] }
      );

      if (!product) {
        return res.status(404).json({ message: `Producto ${productId} no existe` });
      }

      const activePrice = product.prices.getItems().find((p: any) => !p.endDate);
      if (!activePrice) {
        return res.status(400).json({ message: `Producto "${product.name}" sin precio activo` });
      }

      // ✅ Validar stock
      if (product.stock < qty) {
        return res.status(409).json({
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, pedido: ${qty}`,
        });
      }

      // ✅ Descontar stock
      product.stock = product.stock - qty;

      const subtotal = Number(activePrice.amount) * qty;
      total += subtotal;

      const lineItem = em.create(LineItemOrder, {
        cantidad: qty,
        fecha: new Date(),
        subtotal,
        order,
        product, // relación ManyToOne
      });

      order.items.add(lineItem);
    }

    // 3) Set total y persistir order + items (cascade)
    order.total = total;

    await em.persistAndFlush(order);

    // ==========================================================
    // ✅ 4) ACÁ VA EL STATUS INICIAL (igual a Adoption)
    // ==========================================================
    const pending =
      (await em.findOne(OrderState, { type: 'PENDIENTE' })) ??
      (await em.findOne(OrderState, { type: 'pendiente' }));

    if (!pending) {
      return res.status(500).json({ message: 'No existe OrderState PENDIENTE precargado' });
    }

    const s = em.create(OrderStatus, {
      statusChangeDate: new Date(),
      motive: 'Pedido creado',
      order,
      orderState: pending,
    });

    await em.persistAndFlush(s);

    // 5) (Opcional) devolver la order con populate
    const created = await em.findOneOrFail(
      Order,
      { id: order.id },
      {
        populate: [
          'person',
          'items',
          'items.product',
          'items.product.photos',
          'orderStatus',
          'orderStatus.orderState',
        ],
      }
    );

    return res.status(201).json({ message: 'checkout ok', data: created });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

//manejo de estados del pedido y filtrado por shelter  
async function addStatusForShelter(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: 'ID inválido' });

    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);

    if (role !== 'SHELTER') return res.status(403).json({ message: 'No autorizado' });
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const { type, motive } = req.body;
    const nextType = String(type || '').toUpperCase();
    if (!nextType) return res.status(400).json({ message: 'type requerido' });

    // Traigo la orden y verifico que tenga items de este shelter
    const order = await em.findOne(
      Order,
      { id: orderId, items: { product: { shelter: shelterId as any } } } as any,
      { populate: ['orderStatus', 'orderStatus.orderState', 'items', 'items.product', 'items.product.shelter'] }
    );

    if (!order) return res.status(404).json({ message: 'Orden no encontrada para este shelter' });

    const state = await em.findOne(OrderState, { type: nextType });
    if (!state) return res.status(400).json({ message: `OrderState ${nextType} no existe` });

    const current = getLatestStateType(order);
    if (current === state.type) {
      return res.status(409).json({ message: `La orden ya está en estado ${current}` });
    }

    const status = em.create(OrderStatus, {
      statusChangeDate: new Date(),
      motive: motive ?? null,
      order,
      orderState: state,
    });

    await em.persistAndFlush(status);

    return res.status(201).json({
      message: 'order status created',
      data: { orderId: order.id, currentState: state.type }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function findForShelter(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);

    if (role !== 'SHELTER') return res.status(403).json({ message: 'No autorizado' });
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const orders = await em.find(
      Order,
      { items: { product: { shelter: shelterId as any } } } as any,
      {
        populate: [
          'person',
          'items',
          'items.product',
          'items.product.photos',
          'items.product.shelter',
          'orderStatus',
          'orderStatus.orderState',
        ],
        orderBy: { fecha: 'DESC' as any },
      }
    );

    const data = orders.map((o: any) => ({
      id: o.id,
      fecha: o.fecha,
      total: o.total,
      currentState: getLatestStateType(o),
      customer: {
        id: o.person?.id ?? null,
        name: o.person?.name ?? o.person?.firstName ?? '—',
        email: o.person?.email ?? null,
        phone: o.person?.phone ?? null,
      },
      items: (o.items?.getItems ? o.items.getItems() : o.items).map((li: any) => ({
        qty: li.cantidad,
        subtotal: li.subtotal,
        product: {
          id: li.product?.id,
          name: li.product?.name,
          photo: li.product?.photos?.[0]?.url ?? null,
        }
      }))
    }));

    return res.status(200).json({ message: 'shelter orders', data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

async function findOneForShelter(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) return res.status(400).json({ message: 'ID inválido' });

    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);

    if (role !== 'SHELTER') return res.status(403).json({ message: 'No autorizado' });
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });
    const order = await em.findOne(
      Order,
      { id: orderId, items: { product: { shelter: shelterId as any } } } as any,
      {
        populate: [
          'person',
          'items',
          'items.product',
          'items.product.photos',
          'items.product.shelter',
          'orderStatus',
          'orderStatus.orderState',
        ],
      }
    );

    if (!order) return res.status(404).json({ message: 'Orden no encontrada para este shelter' });
    const allItems = order.items.getItems ? order.items.getItems() : (order as any).items;
    const shelterItems = allItems.filter((li: any) => Number(li?.product?.shelter?.id) === shelterId);

    const dto = {
      id: order.id,
      fecha: order.fecha,
      total: order.total,
      currentState: getLatestStateType(order),
      customer: {
        id: (order as any).person?.id ?? null,
        name: (order as any).person?.name ?? (order as any).person?.firstName ?? '—',
        email: (order as any).person?.email ?? null,
        phone: (order as any).person?.phone ?? null,
      },
      items: shelterItems.map((li: any) => ({
        qty: li.cantidad,
        subtotal: li.subtotal,
        product: {
          id: li.product?.id,
          name: li.product?.name,
          photo: li.product?.photos?.[0]?.url ?? null,
        }
      })),
      timeline: getStatusesArray(order)
        .map((s: any) => ({
          id: s.id,
          date: s.statusChangeDate,
          motive: s.motive ?? '',
          type: s.orderState?.type ?? '—'
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };

    return res.status(200).json({ message: 'order detail for shelter', data: dto });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}


export {findAll,findOne,add,update,remove,addLineItem,removeLineItem,sanitizeOrderInput,sanitizeLineItemInput,checkout, findForShelter, addStatusForShelter, findOneForShelter};
