import { Router } from "express";
import { sanitizeCityInput, findAll, findOne, add, update, remove } from "./city.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const cityRouter = Router();

cityRouter.get('/', validateToken ,findAll)
cityRouter.get('/:id', validateToken ,findOne)
cityRouter.post('/', validateToken ,sanitizeCityInput, add)
cityRouter.put('/:id', validateToken ,sanitizeCityInput, update)
cityRouter.patch('/:id', validateToken ,sanitizeCityInput, update)
cityRouter.delete('/:id', validateToken ,sanitizeCityInput, remove)