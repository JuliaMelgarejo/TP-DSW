import '../../scr/config/env.js';
import "reflect-metadata";
import { orm } from "../zshare/db/orm.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { User } from "../user/user.entity.js";
import { Address } from "../address/address.entity.js";
import { UserRole } from "../common/enums/user-role.enum.js";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedShelters() {
  const em = orm.em.fork();
  try {
    const sheltersData = [
      {
        name: "Refugio Patitas Unidas",
        phone: "341-555-1234",
      },
      {
        name: "Hogar Animal San Lorenzo",
        phone: "3476-444-222",
      },
      {
        name: "Rescate Norte",
        phone: "342-777-8899",
      },
    ];

    for (let i = 0; i < sheltersData.length; i++) {
      const data = sheltersData[i];
      console.log(`Entrando a generar: ${data.name}`);

      // 1. Crear User (lado owner de la relación)
      const user = em.create(User, {
        username: `shelter_${i + 1}`,
        password: "123456", // en real debería ir hashed
        role: UserRole.SHELTER,
      });
      console.log(`Usuario creado: ${user}`);

      // 2. Crear Shelter
      const shelter = em.create(Shelter, {
        name: data.name,
        phoneNumber: data.phone,
        tuitionVet: `VET-${randomInt(1000, 9999)}`, // mockeado
        max_capacity: randomInt(10, 200),
      });
      console.log(`Shelter creado: ${shelter}`);

      // 3. Address (mock tipo Google Maps)
      const seed = i + 1
      const baseLat = -32.95;
      const baseLng = -60.66;
      const address = em.create(Address, {
        latitude: baseLat + Math.random() * 0.2,
        longitude: baseLng + Math.random() * 0.2,
        formattedAddress: `Calle ${randomInt(100, 5000)} #${seed}, Santa Fe, Argentina`,
        placeId: `fake-place-${seed}`,
        street: `Calle ${randomInt(100, 5000)}`,
        streetNumber: `${randomInt(1, 9999)}`,
        city: seed % 2 === 0 ? "Santa Fe" : "Rosario",
        postalCode: `S4${randomInt(100, 999)}`,
        province: "Santa Fe",
        country: "Argentina",
      });
      shelter.address = address;
      console.log(`Direccion asociada: ${address.formattedAddress}`);

      // 4. Relación User <-> Shelter (IMPORTANTE: lado dueño es User)
      user.shelter = shelter;

      // 5. Persist
      em.persist(user);
      em.persist(shelter);
      console.log(`Refugio persistido: ${i}`);
    }

    await em.flush();

    console.log(`Seed completado`);

    process.exit(0);
  } catch (error) {

    console.error("Error en seed:", error);

    process.exit(1);
  }
}

seedShelters()