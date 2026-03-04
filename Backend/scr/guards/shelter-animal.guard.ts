// scr/guards/shelter-animal.guard.ts
import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Animal } from '../animal/animal.entity.js';

export async function shelterAnimalGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const role = String(user?.role || '').toLowerCase();
    const shelterId = Number(user?.shelterId);

    if (role !== 'shelter') return next();
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const raw = req.params.animalId ?? req.params.id;
    const animalId = Number(raw);
    if (!animalId) return res.status(400).json({ message: 'animalId inválido' });

    const em = orm.em.fork();

    // ⚠️ en tu código usás rescueClass.shelters (nombre de propiedad)
    const animal = await em.findOne(Animal, { id: animalId, rescueClass: { shelters: shelterId as any } } as any);
    if (!animal) return res.status(403).json({ message: 'No autorizado para este animal' });

    (req as any).animal = animal;
    return next();
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}