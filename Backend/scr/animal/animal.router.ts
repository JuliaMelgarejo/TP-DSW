import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./animal.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { add as addAdoption, sanitizeAdoptionInput } from "../adoption/adoption.controler.js";

export const animalRouter = Router();

animalRouter.get('/',validateToken, findAll)
animalRouter.get('/:id',validateToken, findOne)
animalRouter.post('/', validateToken, add)
animalRouter.put('/:id', validateToken, update)
animalRouter.delete('/:id', validateToken, remove)
animalRouter.post('/:animalId/adoptions',validateToken,sanitizeAdoptionInput,addAdoption);

