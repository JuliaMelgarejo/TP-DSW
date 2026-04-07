import { Router } from 'express';
import { checkUsername, login, newUser, sanitizeUserInput } from './user.controler.js';

export const userRouter = Router();

userRouter.get('/check-username/:username', checkUsername);
userRouter.post('/', sanitizeUserInput, newUser)
userRouter.post('/login', login)