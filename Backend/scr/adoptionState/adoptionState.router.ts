import { Router } from "express";
import { sanitizeAdoptionStateInput, findAll, findOne, add, update, remove } from "./adoptionState.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const adoptionStateRouter = Router();

adoptionStateRouter.get('/', validateToken ,findAll)
adoptionStateRouter.get('/:id', validateToken ,findOne)
adoptionStateRouter.post('/', validateToken ,sanitizeAdoptionStateInput, add)
adoptionStateRouter.put('/:id', validateToken ,sanitizeAdoptionStateInput, update)
adoptionStateRouter.patch('/:id', validateToken ,sanitizeAdoptionStateInput, update)
adoptionStateRouter.delete('/:id', validateToken ,sanitizeAdoptionStateInput, remove)