import { Router } from "express";
import { 
  findAll, 
  findOne, 
  add, 
  update, 
  remove, 
  sanitizeShelterInput,
  findByBoundary,
} from "./shelter.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { authorizeRoles } from '../middlewares/authorize-role.js';

export const shelterRouter = Router();

shelterRouter.get('/findByBoundary', validateToken, findByBoundary)
shelterRouter.get('/', validateToken, findAll)
shelterRouter.get('/:id', validateToken, findOne)
shelterRouter.post('/', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeShelterInput, add)
shelterRouter.put('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeShelterInput, update)
shelterRouter.patch('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeShelterInput, update)
shelterRouter.delete('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), remove)
