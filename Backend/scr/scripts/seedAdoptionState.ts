import "reflect-metadata";
import { AdoptionState } from "../adoptionState/adoptionState.entity.js";
import { orm } from "../zshare/db/orm.js";

async function seedAdoptionState() {
  const em = orm.em.fork();

  try {
    const estadosAdopcion = [
      { type: "Pendiente", description: "Productos alimenticios" },
      { type: "Aceptado", description: "Indumentaria y accesorios" },
      { type: "Enviado", description: "Artículos para el hogar" },
      { type: "Entregado", description: "Juguetes para mascotas" },
      { type: "Cancelado", description: "Camas para mascotas" }
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