import { Router } from "express";
import { 
  getCountries, 
  getProvinces, 
  getCities,
} from "./location.controller.js";

export const locationRouter = Router();

locationRouter.get('/countries', getCountries)
locationRouter.get('/provinces', getProvinces)
locationRouter.get('/cities', getCities)
