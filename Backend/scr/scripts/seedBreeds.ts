import '../../scr/config/env.js';
import "reflect-metadata";
import { orm } from "../zshare/db/orm.js";
import { Breed } from '../breed/breed.entity.js';

async function seedBreeds() {
  const em = orm.em.fork();

  try {
    const breeds = [
      { name: "Gato", description: "Canino" },
      { name: "Perro", description: "Felino" },
      { name: "Caballo", description: "Que haces con esto?" },
    ];

    for (const breed of breeds) {

      const exists = await em.findOne(Breed, { name: breed.name });

      if (!exists) {
        const newBreed = em.create(Breed, breed);
        await em.persist(newBreed);
        console.log(`Insertada: ${breed.name}`);
      } else {
        console.log(`Ya existe: ${breed.name}`);
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

seedBreeds();