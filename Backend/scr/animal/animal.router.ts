import { Router } from "express";
import { findAll, findOne, add, update, remove, findByShelter } from "./animal.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { add as addAdoption, sanitizeAdoptionInput } from "../adoption/adoption.controler.js";
import { shelterAnimalGuard } from "../guards/shelter-animal.guard.js";

export const animalRouter = Router();

animalRouter.get('/', validateToken, findAll)
animalRouter.get('/shelter/:shelterId', validateToken, findByShelter);
animalRouter.get('/:id',validateToken,shelterAnimalGuard, findOne)
animalRouter.post('/', validateToken,shelterAnimalGuard ,add)
animalRouter.put('/:id', validateToken,shelterAnimalGuard ,update)
animalRouter.delete('/:id', validateToken,shelterAnimalGuard ,remove)
animalRouter.post('/:animalId/adoptions',validateToken,sanitizeAdoptionInput,addAdoption);

