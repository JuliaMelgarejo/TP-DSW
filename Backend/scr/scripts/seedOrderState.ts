import '../../scr/config/env.js';
import "reflect-metadata";
import { OrderState } from '../orderState/orderstate.entity.js'
import { orm } from "../zshare/db/orm.js";

async function seedOrderState() {
  const em = orm.em.fork();

  try {
    const estadosPedido = [
      { type: "Pendiente", description: "Se resgistro el pedido" },
      { type: "Aceptado", description: "El pedido esta en preparación" },
      { type: "Enviado", description: "El pedido se encuentra en camino" },
      { type: "Entregado", description: "Su pedido ah llegado a destino" },
      { type: "Cancelado", description: "Su pedido ha sido cancelado" },
      { type: "Rechazado", description: "Su pedido ha sido rechazado" }
    ];

    for (const es of estadosPedido) {

      const exists = await em.findOne(OrderState, { type: es.type });

      if (!exists) {
        const newOrderState = em.create(OrderState, es);
        await em.persist(newOrderState);
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

seedOrderState();