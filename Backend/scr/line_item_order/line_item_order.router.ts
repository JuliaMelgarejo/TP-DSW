// line-item.routes.ts
import { Router } from "express";
import { findAll, findOne } from "./line_item_order.controller.js";
import { validateToken } from "../validate-token/validate-token.routes.js";

export const lineItemRouter = Router();

lineItemRouter.get('/', validateToken, findAll);
lineItemRouter.get('/:id', validateToken, findOne);
