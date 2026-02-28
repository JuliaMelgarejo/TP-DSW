import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


export class Photo {
  id?: number;
  url!: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

