import { Router } from "express";
import { sanitizeProvinceInput, findAll, findOne, add, update, remove, findByCountry } from "./province.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const provinceRouter = Router();

provinceRouter.get('/' ,findAll)
provinceRouter.get('/:id',findOne)
provinceRouter.get('/by-country/:countryId' ,findByCountry)
provinceRouter.post('/', validateToken ,sanitizeProvinceInput, add)
provinceRouter.put('/:id', validateToken ,sanitizeProvinceInput, update)
provinceRouter.patch('/:id', validateToken ,sanitizeProvinceInput, update)
provinceRouter.delete('/:id', validateToken ,sanitizeProvinceInput, remove)