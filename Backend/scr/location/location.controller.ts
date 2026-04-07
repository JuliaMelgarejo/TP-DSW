import { Request, Response } from "express";
import { orm } from "../zshare/db/orm.js";
import { Shelter } from "../shelter/shelter.entity.js";
import { Rescue } from "../rescue/rescue.entity.js";

export const getCountries = async (req: Request, res: Response) => {
  const type = req.query.type;
  let results;
  if (type === "rescue") {
    results = await orm.em.find(Rescue, {}, {
      populate: ["address"],
      fields: ["address.country"],
    });
  } else {
    results = await orm.em.find(Shelter, {}, {
      populate: ["address"],
      fields: ["address.country"],
    });
  }

  const countries = [
    ...new Set(results.map(r => r.address?.country).filter(Boolean))
  ];
  res.json(countries);
};

export const getProvinces = async (req: Request, res: Response) =>{
  const type = req.query.type;
  const country = req.query.country as string;
  let results;
  if (type === "rescue") {
    results = await orm.em.find(Rescue, { address: { country: country } },
    {
      populate: ["address"],
      fields: ["address.province"],
    });
  } else {
    results = await orm.em.find(Shelter, { address: { country: country } },
    {
      populate: ["address"],
      fields: ["address.province"],
    });
  }

  const provinces = [...new Set(results.map(s => s.address?.province).filter(Boolean))];
  res.json(provinces);
}

export const getCities = async (req: Request, res: Response) =>{
  const type = req.query.type;
  const province = req.query.province as string;
  let results;
  if (type === "rescue") {
    results = await orm.em.find(Rescue, { address: { province: province } },
    {
      populate: ["address"],
      fields: ["address.city"],
    });
  } else {
    results = await orm.em.find(Shelter, { address: { province: province } },
    {
      populate: ["address"],
      fields: ["address.city"],
    });
  }

  const cities = [...new Set(results.map(s => s.address?.city).filter(Boolean))];
  res.json(cities);
}