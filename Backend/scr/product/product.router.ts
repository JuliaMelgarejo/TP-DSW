import { Router } from "express";
import { sanitizeProductInput, findAll, findOne, add, update, remove } from "./product.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const productRouter = Router();

productRouter.get('/', validateToken ,findAll)
productRouter.get('/:id', validateToken ,findOne)
productRouter.post('/', validateToken ,sanitizeProductInput, add)
productRouter.put('/:id', validateToken ,sanitizeProductInput, update)
productRouter.patch('/:id', validateToken ,sanitizeProductInput, update)
productRouter.delete('/:id', validateToken ,sanitizeProductInput, remove)