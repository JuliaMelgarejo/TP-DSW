import { Router } from "express";
import { sanitizeProvinceInput, findAll, findOne, add, update, remove } from "./province.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const provinceRouter = Router();

provinceRouter.get('/', validateToken ,findAll)
provinceRouter.get('/:id', validateToken ,findOne)
provinceRouter.post('/', validateToken ,sanitizeProvinceInput, add)
provinceRouter.put('/:id', validateToken ,sanitizeProvinceInput, update)
provinceRouter.patch('/:id', validateToken ,sanitizeProvinceInput, update)
provinceRouter.delete('/:id', validateToken ,sanitizeProvinceInput, remove)