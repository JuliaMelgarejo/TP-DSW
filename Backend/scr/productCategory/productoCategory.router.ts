import { Router } from "express";
import { sanitizeCategoryInput, findAll, findOne, add, update, remove } from "./productCategory.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const categoryRouter = Router();

categoryRouter.get('/', validateToken ,findAll)
categoryRouter.get('/:id', validateToken ,findOne)
categoryRouter.post('/', validateToken ,sanitizeCategoryInput, add)
categoryRouter.put('/:id', validateToken ,sanitizeCategoryInput, update)
categoryRouter.patch('/:id', validateToken ,sanitizeCategoryInput, update)
categoryRouter.delete('/:id', validateToken ,sanitizeCategoryInput, remove)