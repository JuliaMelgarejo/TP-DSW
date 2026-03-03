import "reflect-metadata";
import { Category } from "../productCategory/productCategory.entity.js";
import { orm } from "../zshare/db/orm.js";

async function seedCategories() {
  const em = orm.em.fork();

  try {
    const categories = [
      { name: "Comida", description: "Productos alimenticios" },
      { name: "Ropa", description: "Indumentaria y accesorios" },
      { name: "Hogar", description: "Artículos para el hogar" },
      { name: "Juguetes", description: "Juguetes para mascotas" },
      { name: "Camas", description: "Camas para mascotas" }
    ];

    for (const cat of categories) {

      const exists = await em.findOne(Category, { name: cat.name });

      if (!exists) {
        const newCategory = em.create(Category, cat);
        await em.persist(newCategory);
        console.log(`Insertada: ${cat.name}`);
      } else {
        console.log(`Ya existe: ${cat.name}`);
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

seedCategories();