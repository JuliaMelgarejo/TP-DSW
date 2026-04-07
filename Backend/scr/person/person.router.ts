import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  findOneByDoc,
  sanitizePersonInput,
  getDocumentTypes
} from "./person.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import { authorizeRoles } from "../common/middlewares/authorize-role.js";

export const personRouter = Router();

personRouter.get('/:doc_type/:doc_nro', validateToken, sanitizePersonInput, findOneByDoc)
personRouter.get('/document-types', getDocumentTypes);
personRouter.get('/:id', validateToken, findOne)
personRouter.get('/', authorizeRoles('ADMIN'), validateToken, findAll)
personRouter.put('/:id',validateToken, sanitizePersonInput, update)
personRouter.post('/', sanitizePersonInput, add)
personRouter.delete('/:id', validateToken,sanitizePersonInput, remove)