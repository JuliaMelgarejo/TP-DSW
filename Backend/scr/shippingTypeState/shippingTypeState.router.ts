import { Router } from "express";
import { sanitizeShippingTypeStateInput, findAll, findOne, add, update, remove } from "./shippingTypeState.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const shippingTypeStateRouter = Router();

shippingTypeStateRouter.get('/', validateToken ,findAll)
shippingTypeStateRouter.get('/:id', validateToken ,findOne)
shippingTypeStateRouter.post('/', validateToken ,sanitizeShippingTypeStateInput, add)
shippingTypeStateRouter.put('/:id', validateToken ,sanitizeShippingTypeStateInput, update)
shippingTypeStateRouter.patch('/:id', validateToken ,sanitizeShippingTypeStateInput, update)
shippingTypeStateRouter.delete('/:id', validateToken ,sanitizeShippingTypeStateInput, remove)