import { Router } from "express";
import { sanitizeOrderStatusInput, findAll, findOne, add, update, remove } from "./orderStatus.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const orderStatusRouter = Router();

orderStatusRouter.get('/', validateToken ,findAll)
orderStatusRouter.get('/:id', validateToken ,findOne)
orderStatusRouter.post('/', validateToken ,sanitizeOrderStatusInput, add)
orderStatusRouter.put('/:id', validateToken ,sanitizeOrderStatusInput, update)
orderStatusRouter.patch('/:id', validateToken ,sanitizeOrderStatusInput, update)
orderStatusRouter.delete('/:id', validateToken ,sanitizeOrderStatusInput, remove)