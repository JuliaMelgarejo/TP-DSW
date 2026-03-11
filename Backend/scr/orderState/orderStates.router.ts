import { Router } from "express";
import { sanitizeOrderStateInput, findAll, findOne, add, update, remove } from "./orderState.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const orderStateRouter = Router();

orderStateRouter.get('/', validateToken ,findAll)
orderStateRouter.get('/:id', validateToken ,findOne)
orderStateRouter.post('/', validateToken ,sanitizeOrderStateInput, add)
orderStateRouter.put('/:id', validateToken ,sanitizeOrderStateInput, update)
orderStateRouter.patch('/:id', validateToken ,sanitizeOrderStateInput, update)
orderStateRouter.delete('/:id', validateToken ,sanitizeOrderStateInput, remove)