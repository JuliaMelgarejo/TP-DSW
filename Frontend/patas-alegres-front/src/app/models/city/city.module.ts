import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export class City{
  id?: number;
  name: string;
  zipCode: number;
  updatedAt: Date;
  createdAt: Date;
  province: number;


  constructor(id: number, name: string, updatedAt: Date, createdAt: Date, zipCode: number, province: number) {
    this.id = id;
    this.name = name;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.zipCode = zipCode;
    this.province = province;

  }
 }
