import "reflect-metadata";
import { orm } from "../zshare/db/orm.js";
import { Product } from "../product/product.entity.js";
import { Price } from "../price/price.entity.js";
import { Category } from "../productCategory/productCategory.entity.js";
import { Shelter } from "../shelter/shelter.entity.js";

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedProducts(total: number = 50) {
  const em = orm.em.fork();

  try {
    const categories = await em.find(Category, {});
    const shelters = await em.find(Shelter, {});

    if (categories.length === 0 || shelters.length === 0) {
      console.log("Necesitas al menos 1 categoría y 1 refugio");
      process.exit(1);
    }

    for (let i = 1; i <= total; i++) {

      const name = `Producto ${i}`;

      const exists = await em.findOne(Product, { name });

      if (exists) {
        console.log(`Ya existe: ${name}`);
        continue;
      }

      const price = randomBetween(1000, 20000);

      let crossedOut: number | undefined = undefined;

      if (isPrime(i)) {
        crossedOut = price + randomBetween(500, 5000);
      }

      const product = em.create(Product, {
        name,
        description: `Descripción automática del producto ${i}`,
        stock: randomBetween(1, 100),
        crossed_out_price: crossedOut,
        category: categories[i % categories.length],
        shelter: shelters[i % shelters.length],
      });

      const newPrice = em.create(Price, {
        amount: price,
        startDate: new Date(),
        product,
      });

      product.prices.add(newPrice);

      await em.persist(product);

      console.log(`Insertado: ${name}`);
    }

    await em.flush();

    console.log(`Seed completado (${total} productos)`);

    process.exit(0);

  } catch (error) {
    console.error("Error en seed:", error);
    process.exit(1);
  }
}

const totalProducts = Number(process.argv[2]) || 50;

seedProducts(totalProducts);