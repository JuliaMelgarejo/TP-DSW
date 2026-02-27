import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


export class Country { 
  id?: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;

  constructor(id: number, name: string, updatedAt: Date, createdAt: Date){
    this.id = id;
    this.name = name;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
  }


}
