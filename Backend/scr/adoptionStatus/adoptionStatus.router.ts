import { Router } from "express";
import { sanitizeAdoptionStatusInput, findAll, findOne, add, update, remove } from "./adoptionStatus.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const adoptionStatusRouter = Router();

adoptionStatusRouter.get('/', validateToken ,findAll)
adoptionStatusRouter.get('/:id', validateToken ,findOne)
adoptionStatusRouter.post('/', validateToken ,sanitizeAdoptionStatusInput, add)
adoptionStatusRouter.put('/:id', validateToken ,sanitizeAdoptionStatusInput, update)
adoptionStatusRouter.patch('/:id', validateToken ,sanitizeAdoptionStatusInput, update)
adoptionStatusRouter.delete('/:id', validateToken ,sanitizeAdoptionStatusInput, remove)