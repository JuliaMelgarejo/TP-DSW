import { Router } from "express";
import { sanitizeCountryInput, findAll, findOne, add, update, remove } from "./country.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const countryRouter = Router();

countryRouter.get('/', validateToken ,findAll)
countryRouter.get('/:id', validateToken ,findOne)
countryRouter.post('/', validateToken ,sanitizeCountryInput, add)
countryRouter.put('/:id', validateToken ,sanitizeCountryInput, update)
countryRouter.patch('/:id', validateToken ,sanitizeCountryInput, update)
countryRouter.delete('/:id', validateToken ,sanitizeCountryInput, remove)