import { Router } from "express";
import {
  findOne,
  add,
  update,
  remove,
  findAllShelters,
  sanitizeAddressInput
} from "./address.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const addressRouter = Router();

addressRouter.get('/:id', validateToken, findOne)
addressRouter.get('/', validateToken, findAllShelters)
addressRouter.put('/:id', validateToken, sanitizeAddressInput, update)
addressRouter.post('/', sanitizeAddressInput, add)
addressRouter.delete('/:id', validateToken, sanitizeAddressInput, remove)