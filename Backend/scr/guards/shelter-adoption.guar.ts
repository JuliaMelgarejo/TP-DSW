// scr/guards/shelter-adoption.guard.ts
import { Request, Response, NextFunction } from 'express';
import { orm } from '../zshare/db/orm.js';
import { Adoption } from '../adoption/adoption.entity.js';

export async function shelterAdoptionGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const role = String(user?.role || '').toLowerCase();
    const shelterId = Number(user?.shelterId);

    if (role !== 'shelter') return next();
    if (!shelterId) return res.status(401).json({ message: 'Token sin shelterId' });

    const adoptionId = Number(req.params.id);
    if (!adoptionId) return res.status(400).json({ message: 'ID inválido' });

    const em = orm.em.fork();

    const adoption = await em.findOne(
      Adoption,
      { id: adoptionId, animal: { rescueClass: { shelters: shelterId as any } } } as any,
      { populate: ['animal', 'animal.photos', 'animal.rescueClass', 'animal.rescueClass.shelters', 'person', 'statuses', 'statuses.adoptionState'] }
    );

    if (!adoption) return res.status(403).json({ message: 'No autorizado' });

    (req as any).adoption = adoption;
    return next();
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}