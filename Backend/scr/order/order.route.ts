// order.routes.ts
import { Router } from "express";
import {findAll,findOne,add,update,remove,checkout,addLineItem,removeLineItem,sanitizeOrderInput,sanitizeLineItemInput, findForShelter, addStatusForShelter, findOneForShelter,
} from "./order.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const orderRouter = Router();

orderRouter.get('/', validateToken, findAll);
orderRouter.post('/checkout', validateToken, checkout);
orderRouter.get('/shelter', validateToken, findForShelter);
orderRouter.get('/shelter/:id', validateToken, findOneForShelter);
orderRouter.post('/:id/status', validateToken, addStatusForShelter);

orderRouter.get('/:id', validateToken, findOne);
orderRouter.post('/', validateToken, sanitizeOrderInput, add);
orderRouter.put('/:id', validateToken, sanitizeOrderInput, update);
orderRouter.delete('/:id', validateToken, remove);
orderRouter.post('/:id/items',validateToken, sanitizeLineItemInput, addLineItem);
orderRouter.delete('/:id/items/:itemId',validateToken,removeLineItem);
