import { Router } from "express";
import {  findAll, findOne, add, update, remove, sanitizeRescueInput } from "./rescue.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const rescueRouter = Router();

rescueRouter.get('/', validateToken ,sanitizeRescueInput,findAll)
rescueRouter.get('/:id', validateToken ,sanitizeRescueInput, findOne)
rescueRouter.post('/', validateToken ,sanitizeRescueInput,add)
rescueRouter.patch('/:id', validateToken ,sanitizeRescueInput,update)
rescueRouter.delete('/:id', validateToken ,sanitizeRescueInput,remove)
rescueRouter.put('/:id', validateToken ,sanitizeRescueInput,update)
