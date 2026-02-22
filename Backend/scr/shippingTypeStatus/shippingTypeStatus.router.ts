import { Router } from "express";
import { sanitizeShippingTypeStatusInput, findAll, findOne, add, update, remove } from "./shippingTypeStatus.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const shippingTypeStatusRouter = Router();

shippingTypeStatusRouter.get('/', validateToken ,findAll)
shippingTypeStatusRouter.get('/:id', validateToken ,findOne)
shippingTypeStatusRouter.post('/', validateToken ,sanitizeShippingTypeStatusInput, add)
shippingTypeStatusRouter.put('/:id', validateToken ,sanitizeShippingTypeStatusInput, update)
shippingTypeStatusRouter.patch('/:id', validateToken ,sanitizeShippingTypeStatusInput, update)
shippingTypeStatusRouter.delete('/:id', validateToken ,sanitizeShippingTypeStatusInput, remove)