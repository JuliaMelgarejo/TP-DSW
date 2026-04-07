import { Address } from "../address/address.js";
import { Rescue } from "../rescue/rescue.model.js";

export class Shelter {
  id?: number;
  name: string;
  phoneNumber?: string;
  tuitionVet!: string;
  address: Address;
  max_capacity: number;
  rescues: Rescue[] = [];
  distance?: number;

  constructor(name: string, phoneNumber: string, tuitionVet: string, address: Address, max_capacity: number, rescues: Rescue[] = [], distance?: number, id?: number){
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.tuitionVet = tuitionVet;
    this.address = address;
    this.max_capacity = max_capacity;
    this.rescues = rescues;
    this.distance = distance;
    this.id = id;
  }
}
