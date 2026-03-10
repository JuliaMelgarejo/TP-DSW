import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Order } from './order.entity.js';
import { LineItemOrder } from '../line_item_order/line_item_order.entity.js';
import { Product } from '../product/product.entity.js';
import { Person } from '../person/person.entity.js';
import { OrderState } from '../orderState/orderstate.entity.js';
import { OrderStatus } from '../orderStatus/orderStatus.entity.js';

const em = orm.em;

// ===========================
// HELPERS
// ===========================
const SHELTER_FORBIDDEN_TARGETS = new Set(['PENDIENTE', 'CANCELADO']);
const FINAL_STATES = new Set(['ENTREGADO', 'CANCELADO']);

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
    product: req.body.product,
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

  return String(latest?.orderState?.type || 'PENDIENTE').toUpperCase();
}

const ALLOWED_TRANSITIONS_BY_SHELTER: Record<string, string[]> = {
  PENDIENTE: ['ACEPTADO', 'RECHAZADO'],
  ACEPTADO: ['ENVIADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  RECHAZADO: [],
  CANCELADO: [],
};

function validateShelterOrderTransition(current: string, next: string): { ok: boolean; message?: string; statusCode?: number } {
  if (current === next) {
    return {
      ok: false,
      message: `La orden ya está en estado ${current}`,
      statusCode: 409,
    };
  }

  const allowed = ALLOWED_TRANSITIONS_BY_SHELTER[current] ?? [];

  if (!allowed.includes(next)) {
    return {
      ok: false,
      message: `No se puede cambiar de ${current} a ${next}`,
      statusCode: 409,
    };
  }

  return { ok: true };
}

function buildOrderListDto(o: any, role: string, personId?: number, shelterId?: number) {
  const items = o.items?.getItems ? o.items.getItems() : o.items ?? [];

  let visibleItems = items;

  if (role === 'SHELTER') {
    visibleItems = items.filter((li: any) => Number(li?.product?.shelter?.id) === Number(shelterId));
  }

  const firstItem = visibleItems[0];

  return {
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
    items: visibleItems.map((li: any) => ({
      qty: li.cantidad,
      subtotal: li.subtotal,
      product: {
        id: li.product?.id,
        name: li.product?.name,
        photo: li.product?.photos?.[0]?.url ?? null,
      },
    })),
    itemsCount: visibleItems.length,
    firstProductName: firstItem?.product?.name ?? null,
  };
}

function buildOrderDetailDto(order: any, role: string, shelterId?: number) {
  const allItems = order.items?.getItems ? order.items.getItems() : order.items ?? [];

  const visibleItems =
    role === 'SHELTER'
      ? allItems.filter((li: any) => Number(li?.product?.shelter?.id) === Number(shelterId))
      : allItems;

  return {
    id: order.id,
    fecha: order.fecha,
    total: order.total,
    currentState: getLatestStateType(order),
    customer: {
      id: order?.person?.id ?? null,
      name: order?.person?.name ?? order?.person?.firstName ?? '—',
      email: order?.person?.email ?? null,
      phone: order?.person?.phone ?? null,
    },
    items: visibleItems.map((li: any) => ({
      qty: li.cantidad,
      subtotal: li.subtotal,
      product: {
        id: li.product?.id,
        name: li.product?.name,
        photo: li.product?.photos?.[0]?.url ?? null,
      },
    })),
    timeline: getStatusesArray(order)
      .map((s: any) => ({
        id: s.id,
        date: s.statusChangeDate,
        motive: s.motive ?? '',
        type: s.orderState?.type ?? '—',
        description: s.orderState?.description ?? '',
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
}

// ===========================
// CRUD BÁSICO
// ===========================
async function findAll(req: Request, res: Response) {
  try {
    const orders = await em.find(Order, {}, {
      populate: ['items', 'orderStatus', 'person']
    });

    return res.status(200).json({ message: 'all orders', data: orders });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const order = await em.findOneOrFail(Order, id, {
      populate: ['items', 'orderStatus', 'person']
    });

    return res.status(200).json({ message: 'order data', data: order });
  } catch (e: any) {
    return res.status(404).json({ message: e.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = req.body.sanitizedOrder;
    const order = em.create(Order, input);

    await em.flush();

    return res.status(201).json({ message: 'order created', data: order });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const input = req.body.sanitizedOrder;
    const order = em.getReference(Order, id);

    em.assign(order, input);
    await em.flush();

    return res.status(200).json({ message: 'order updated', data: order });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const order = em.getReference(Order, id);

    await em.removeAndFlush(order);

    return res.status(200).json({ message: 'order deleted' });
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}

// ===========================
// LINE ITEMS
// ===========================
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

    return res.status(201).json({ message: 'item agregado', data: item });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
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

    return res.status(200).json({ message: 'item eliminado' });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

// ===========================
// CHECKOUT USER
// ===========================
async function checkout(req: Request, res: Response) {
  try {
    const personId = Number((req as any).user?.personId);
    if (!personId) {
      return res.status(401).json({ message: 'Token sin personId' });
    }

    const items = req.body?.items as { productId: number; qty: number }[];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items es requerido' });
    }

    const order = em.create(Order, {
      fecha: new Date(),
      total: 0,
      person: em.getReference(Person, personId),
    });

    let total = 0;

    for (const it of items) {
      const productId = Number(it.productId);
      const qty = Number(it.qty);

      if (!productId || qty <= 0) {
        return res.status(400).json({ message: 'Item inválido' });
      }

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

      if (product.stock < qty) {
        return res.status(409).json({
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, pedido: ${qty}`,
        });
      }

      product.stock = product.stock - qty;

      const subtotal = Number(activePrice.amount) * qty;
      total += subtotal;

      const lineItem = em.create(LineItemOrder, {
        cantidad: qty,
        fecha: new Date(),
        subtotal,
        order,
        product,
      });

      order.items.add(lineItem);
    }

    order.total = total;

    await em.persistAndFlush(order);

    const pending = await em.findOne(OrderState, { type: 'PENDIENTE' });
    if (!pending) {
      return res.status(500).json({ message: 'No existe OrderState PENDIENTE precargado' });
    }

    const status = em.create(OrderStatus, {
      statusChangeDate: new Date(),
      motive: 'Pedido creado',
      order,
      orderState: pending,
    });

    await em.persistAndFlush(status);

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

// ===========================
// SHELTER: CAMBIAR ESTADO
// ===========================
async function addStatusForShelter(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);

    if (role !== 'SHELTER') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (!shelterId) {
      return res.status(401).json({ message: 'Token sin shelterId' });
    }

    const { type, motive } = req.body;
    const nextType = String(type || '').toUpperCase();

    if (!nextType) {
      return res.status(400).json({ message: 'type requerido' });
    }

    const order = await em.findOne(
      Order,
      { id: orderId, items: { product: { shelter: shelterId as any } } } as any,
      {
        populate: [
          'orderStatus',
          'orderStatus.orderState',
          'items',
          'items.product',
          'items.product.shelter',
        ],
      }
    );

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada para este shelter' });
    }

    const current = String(getLatestStateType(order) || '').toUpperCase();
    const transition = validateShelterOrderTransition(current, nextType);

    if (!transition.ok) {
      return res.status(transition.statusCode || 400).json({ message: transition.message });
    }

    const state = await em.findOne(OrderState, { type: nextType });
    if (!state) {
      return res.status(400).json({ message: `OrderState ${nextType} no existe` });
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
      data: {
        orderId: order.id,
        currentState: state.type,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// LISTA DE ÓRDENES DEL USUARIO LOGUEADO
// ===========================
async function findMine(req: Request, res: Response) {
  try {
    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);
    const personId = Number((req as any).user?.personId);

    if (role === 'SHELTER') {
      if (!shelterId) {
        return res.status(401).json({ message: 'Token sin shelterId' });
      }

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

      const data = orders.map((o: any) => buildOrderListDto(o, role, undefined, shelterId));
      return res.status(200).json({ message: 'orders ok', data });
    }

    if (role === 'USER') {
      if (!personId) {
        return res.status(401).json({ message: 'Token sin personId' });
      }

      const orders = await em.find(
        Order,
        { person: personId as any },
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

      const data = orders.map((o: any) => buildOrderListDto(o, role, personId));
      return res.status(200).json({ message: 'orders ok', data });
    }

    return res.status(403).json({ message: 'No autorizado' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// DETALLE DE ORDEN DEL USUARIO LOGUEADO
// ===========================
async function findOneMine(req: Request, res: Response) {
  try {
    const orderId = Number(req.params.id);
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const role = String((req as any).user?.role || '').toUpperCase();
    const shelterId = Number((req as any).user?.shelterId);
    const personId = Number((req as any).user?.personId);

    if (role === 'SHELTER') {
      if (!shelterId) {
        return res.status(401).json({ message: 'Token sin shelterId' });
      }

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

      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada para este shelter' });
      }

      const dto = buildOrderDetailDto(order, role, shelterId);
      return res.status(200).json({ message: 'order detail ok', data: dto });
    }

    if (role === 'USER') {
      if (!personId) {
        return res.status(401).json({ message: 'Token sin personId' });
      }

      const order = await em.findOne(
        Order,
        { id: orderId, person: personId as any },
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

      if (!order) {
        return res.status(404).json({ message: 'Orden no encontrada para este usuario' });
      }

      const dto = buildOrderDetailDto(order, role);
      return res.status(200).json({ message: 'order detail ok', data: dto });
    }

    return res.status(403).json({ message: 'No autorizado' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// ===========================
// MANTENER COMPATIBILIDAD
// ===========================
async function findForShelter(req: Request, res: Response) {
  return findMine(req, res);
}

async function findOneForShelter(req: Request, res: Response) {
  return findOneMine(req, res);
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
  checkout,
  findForShelter,
  addStatusForShelter,
  findOneForShelter,
  findMine,
  findOneMine,
};