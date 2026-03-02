import { Router } from "express";
import { sanitizeAdoptionInput, findAll, findOne, add, update, remove, findMine, findForShelter, findOneForShelter } from "./adoption.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const adoptionRouter = Router();
adoptionRouter.get('/me', validateToken, findMine);
adoptionRouter.get('/shelter', validateToken, findForShelter);
adoptionRouter.get('/shelter/:id', validateToken, findOneForShelter);
adoptionRouter.get('/', validateToken ,findAll)

adoptionRouter.get('/:id', validateToken ,findOne)
adoptionRouter.post('/', validateToken, sanitizeAdoptionInput, add);
adoptionRouter.put('/:id', validateToken ,sanitizeAdoptionInput, update)
adoptionRouter.patch('/:id', validateToken ,sanitizeAdoptionInput, update)
adoptionRouter.delete('/:id', validateToken ,sanitizeAdoptionInput, remove)
