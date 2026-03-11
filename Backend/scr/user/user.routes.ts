import { Router } from 'express';
import { login, newUser, sanitizeUserInput } from './user.controler.js';

export const userRouter = Router();

userRouter.post('/', sanitizeUserInput, newUser)
userRouter.post('/login', login)