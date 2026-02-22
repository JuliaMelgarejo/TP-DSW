import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./photo.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const photoRouter = Router();

photoRouter.get('/',validateToken, findAll)
photoRouter.get('/:id',validateToken, findOne)
photoRouter.post('/',validateToken, add)
photoRouter.put('/:id',validateToken, update)
photoRouter.delete('/:id',validateToken, remove)