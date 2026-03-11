import { Router } from "express";
import { sanitizeAdoptionInput, findAll, add, update, remove, findMine, findForShelter, findOneForShelter, findShelterByAnimal } from "./adoption.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { addStatusForShelter, sanitizeAdoptionStatusInput } from "../adoptionStatus/adoptionStatus.controller.js";
import { shelterAdoptionGuard } from "../guards/shelter-adoption.guar.js";

export const adoptionRouter = Router();
adoptionRouter.get('/me', validateToken, findMine);
adoptionRouter.get('/shelter', validateToken, findForShelter);
adoptionRouter.get('/shelter/:id', validateToken,shelterAdoptionGuard, findOneForShelter);
adoptionRouter.get('/shelter/animals/:animalId',validateToken,shelterAdoptionGuard ,findShelterByAnimal);
adoptionRouter.get('/', validateToken ,findAll)
adoptionRouter.post('/:id/status', validateToken,shelterAdoptionGuard ,addStatusForShelter);
//adoptionRouter.get('/:id', validateToken ,findOne)
adoptionRouter.post('/', validateToken, sanitizeAdoptionInput, add);
adoptionRouter.put('/:id', validateToken ,sanitizeAdoptionInput, update)
adoptionRouter.patch('/:id', validateToken ,sanitizeAdoptionInput, update)
adoptionRouter.delete('/:id', validateToken ,sanitizeAdoptionInput, remove)
