import './scr/config/env.js';
import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import {orm, syncSchema} from './scr/zshare/db/orm.js';
import { RequestContext } from '@mikro-orm/core';

import { animalRouter } from './scr/animal/animal.router.js';
import { breedRouter } from './scr/breed/breed.router.js';
import { personRouter } from './scr/person/person.router.js';
import { shelterRouter } from './scr/shelter/shelter.router.js';
import { zoneRouter } from './scr/zone/zone.router.js';
import { rescueRouter } from './scr/rescue/rescue.router.js';
import { vetRouter } from './scr/vet/vet.router.js';
import { adoptionRouter } from './scr/adoption/adoption.router.js';
import { userRouter } from './scr/user/user.routes.js';
import path from 'path';
import { photoRouter } from './scr/photo/photo.router.js';
import { productRouter } from './scr/product/product.router.js';
import { categoryRouter } from './scr/productCategory/productoCategory.router.js';
import { adoptionStateRouter } from './scr/adoptionState/adoptionState.router.js';
import { adoptionStatusRouter } from './scr/adoptionStatus/adoptionStatus.router.js';
import { orderRouter } from './scr/order/order.route.js';
import { orderStateRouter } from './scr/orderState/orderStates.router.js';
import { orderStatusRouter } from './scr/orderStatus/orderStatus.router.js';
import { addressRouter } from './scr/address/address.router.js';
import { locationRouter } from './scr/location/location.router.js';

const app = express();
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,  // Permitir solicitudes desde el frontend de Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']  // Cabeceras permitidas
}));

//luego de los middlewares base
app.use((req, res, next ) => {
  RequestContext.create(orm.em, next)
})

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


//antes de las rutas y middlewares

app.use('/api/breed', breedRouter)
app.use('/api/animal', animalRouter)
app.use('/api/person', personRouter)
app.use('/api/shelter', shelterRouter)
app.use('/api/zone', zoneRouter)
app.use('/api/rescue', rescueRouter)
app.use('/api/vet', vetRouter)
app.use('/api/adoption', adoptionRouter)
app.use('/api/user', userRouter)

app.use('/api/photo', photoRouter);
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use("/api/adoptionState", adoptionStateRouter);
app.use('/api/adoptionStatus', adoptionStatusRouter);
app.use('/api/order', orderRouter);
app.use('/api/orderStatus', orderStatusRouter);
app.use('/api/orderState', orderStateRouter)

app.use('/api/address', addressRouter);
app.use('/api/location', locationRouter);

if (process.env.NODE_ENV !== 'production' || process.env.RUN_SEEDS === 'true'){
  await syncSchema() //never in production*/
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
console.log('server running on http://localhost:' + PORT);
})
