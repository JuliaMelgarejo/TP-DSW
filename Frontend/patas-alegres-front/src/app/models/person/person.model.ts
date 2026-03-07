import { Address } from "../address/address.js";
import { User } from "../user/user.model.js";

export class Person {
  id?: number;
  name: string; // no
  surname: string; // no
  doc_type: string; // no
  doc_nro: string; // no
  email?: string; // nullable
  phoneNumber?: string; // nullable
  birthdate: string; // no
  nroCuit?: string; // nullable
  user: User;
  address: Address;

  constructor(name: string, surname: string, doc_type: string, doc_nro: string, email: string, phoneNumber: string, birthdate: string, nroCuit: string, createdAt: Date, updatedAt: Date, user: User, address: Address
  ) {
    this.name = name;
    this.surname = surname;
    this.doc_type = doc_type;
    this.doc_nro = doc_nro;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.birthdate = birthdate;
    this.nroCuit = nroCuit;
    this.user = user;
    this.address = address;
  }
}
