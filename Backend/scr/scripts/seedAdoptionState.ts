import '../../scr/config/env.js';
import "reflect-metadata";
import { AdoptionState } from "../adoptionState/adoptionState.entity.js";
import { orm } from "../zshare/db/orm.js";

async function seedAdoptionState() {
  const em = orm.em.fork();

  try {
    const estadosAdopcion = [
      {
        type: 'PENDIENTE',
        description: 'Solicitud creada, pendiente de revisión',
      },
      {
        type: 'APROBADO',
        description: 'Solicitud aprobada por el refugio',
      },
      {
        type: 'RECHAZADO',
        description: 'Solicitud rechazada por el refugio',
      },
      {
        type: 'CANCELADO',
        description: 'Solicitud cancelada por el usuario',
      },
    ];

    for (const es of estadosAdopcion) {

      const exists = await em.findOne(AdoptionState, { type: es.type });

      if (!exists) {
        const newAdoptionState = em.create(AdoptionState, es);
        await em.persist(newAdoptionState);
        console.log(`Insertada: ${es.type}`);
      } else {
        console.log(`Ya existe: ${es.type}`);
      }
    }
    await em.flush();

    console.log("Seed completado");
    process.exit(0);

  } catch (error) {
    console.error("Error en seed:", error);
    process.exit(1);
  }
}

seedAdoptionState();