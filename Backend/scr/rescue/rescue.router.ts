import { Router } from "express";
import {  findAll, findOne, add, update, remove, sanitizeRescueInput } from "./rescue.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { authorizeRoles } from "../middlewares/authorize-role.js";

export const rescueRouter = Router();

rescueRouter.get('/', validateToken ,sanitizeRescueInput,findAll)
rescueRouter.get('/:id', validateToken ,sanitizeRescueInput, findOne)
rescueRouter.post('/', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeRescueInput,add)
rescueRouter.patch('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeRescueInput, update)
rescueRouter.delete('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeRescueInput, remove)
rescueRouter.put('/:id', validateToken, authorizeRoles('SHELTER', 'ADMIN'), sanitizeRescueInput, update)
