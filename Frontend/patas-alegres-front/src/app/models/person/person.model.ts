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
  street: string; // no
  number_street: string; 
  nroCuit?: string; // nullable
  city!: number; // normalmente se envía el id
  user: User;

  constructor(name: string, surname: string, doc_type: string, doc_nro: string, email: string, phoneNumber: string, birthdate: string, street: string, number_street: string, nroCuit: string, createdAt: Date, updatedAt: Date, user: User, city : number, role: string) {
    this.name = name;
    this.surname = surname;
    this.doc_type = doc_type;
    this.doc_nro = doc_nro;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.birthdate = birthdate;
    this.street = street;
    this.number_street = number_street;
    this.nroCuit = nroCuit;
    this.city = city;
    this.user = user;
  }
}
