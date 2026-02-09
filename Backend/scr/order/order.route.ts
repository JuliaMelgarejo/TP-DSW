// order.routes.ts
import { Router } from "express";
import {findAll,findOne,add,update,remove,addLineItem,removeLineItem,sanitizeOrderInput,sanitizeLineItemInput
} from "./order.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const orderRouter = Router();

orderRouter.get('/', validateToken, findAll);
orderRouter.get('/:id', validateToken, findOne);
orderRouter.post('/', validateToken, sanitizeOrderInput, add);
orderRouter.put('/:id', validateToken, sanitizeOrderInput, update);
orderRouter.delete('/:id', validateToken, remove);

// LineItems dentro de Pedido
orderRouter.post(
  '/:id/items',
  validateToken,
  sanitizeLineItemInput,
  addLineItem
);

orderRouter.delete(
  '/:id/items/:itemId',
  validateToken,
  removeLineItem
);
