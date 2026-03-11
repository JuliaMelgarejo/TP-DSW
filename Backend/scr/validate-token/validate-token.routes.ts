import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const headerToken = req.headers['authorization'];

  if (headerToken && headerToken.startsWith('Bearer ')) {
    try {
      const bearerToken = headerToken.slice(7);

      const decoded = jwt.verify(
        bearerToken,
        process.env.SECRET_KEY || 'pepito123'
      ) as any;
      (req as any).user = decoded;

      next();
    } catch (error) {
      return res.status(401).json({ msg: 'token no valido' });
    }
  } else {
    return res.status(401).json({ msg: 'Acceso denegado' });
  }
};
