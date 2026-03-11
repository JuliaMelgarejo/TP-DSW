import "reflect-metadata";
import { orm } from "../zshare/db/orm.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Breed } from "../breed/breed.entity.js";
import { Animal } from "../animal/animal.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";
import { Address } from "../address/address.entity.js";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(from: Date, to: Date) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  return new Date(fromTime + Math.random() * (toTime - fromTime));
}

async function seedAnimals(total: number = 50) {

  const em = orm.em.fork();

  try {

    const breeds = await em.find(Breed, {});
    const shelters = await em.find(Shelter, {});

    if (breeds.length === 0 || shelters.length === 0) {
      console.log("Necesitas al menos 1 raza y 1 refugio");
      process.exit(1);
    }

    const startBirth = new Date("2015-01-01");
    const endBirth = new Date("2025-01-01");

    const startRescue = new Date("2020-01-01");
    const endRescue = new Date();

    for (let i = 1; i <= total; i++) {

      const name = `Animal ${i}`;

      const exists = await em.findOne(Animal, { name });

      if (exists) {
        console.log(`Ya existe: ${name}`);
        continue;
      }

      const shelter = shelters[i % shelters.length];

      const rescueDate = getRandomDate(startRescue, endRescue);
      const birthDate = getRandomDate(startBirth, endBirth);

      const breed = breeds[randomBetween(0, breeds.length - 1)];

      // Address fake
      const address = em.create(Address, {
        latitude: -32.95 + Math.random() * 0.1,
        longitude: -60.66 + Math.random() * 0.1,
        formattedAddress: "Dirección generada automáticamente",
        placeId: `seed_place_${i}`,
        street: "Calle falsa",
        streetNumber: String(randomBetween(100, 999)),
        city: "Rosario",
        postalCode: "2000",
        province: "Santa Fe",
        country: "Argentina",
      });

      // Rescue
      const rescue = em.create(Rescue, {
        rescue_date: rescueDate,
        description: `Rescate automático ${i}`,
        comments: "",
        shelters: shelter,
        address
      });

      // Animal
      const animal = em.create(Animal, {
        name,
        description: `Descripción automática del animal ${i}`,
        birth_date: birthDate,
        breed,
        rescueClass: rescue
      });

      rescue.animals.add(animal);

      em.persist(rescue);

      console.log(`Insertado animal: ${name}`);
    }

    await em.flush();

    console.log(`Seed completado (${total} animales)`);

    process.exit(0);

  } catch (error) {

    console.error("Error en seed:", error);

    process.exit(1);
  }
}

const totalAnimals = Number(process.argv[2]) || 50;

seedAnimals(totalAnimals);