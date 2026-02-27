import { Rescue } from "../rescue/rescue.model.js";
import { Zone } from "../zone/zone.model.js";

export class Shelter {
  id?: number;
  name: string;
  phoneNumber?: string;
  tuitionVet!: string;
  address: string;
  street?: string;
  streetNumber?: number;
  max_capacity: number;
  zone: Zone;
  cityId?: number;
  rescues: Rescue[] = [];

  constructor(name: string, phoneNumber: string, tuitionVet: string, address: string, street: string, streetNumber: number, max_capacity: number, zone: Zone, cityId: number, rescues: Rescue[] = [], id?: number){
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.tuitionVet = tuitionVet;
    this.address = address;
    this.street = street;
    this.streetNumber = streetNumber;
    this.max_capacity = max_capacity;
    this.zone = zone;
    this.cityId = cityId;
    this.rescues = rescues;
    this.id = id;
  }
}
