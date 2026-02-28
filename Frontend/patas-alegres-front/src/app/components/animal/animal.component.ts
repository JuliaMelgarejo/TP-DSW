import { Component } from '@angular/core';
import { AnimalService } from '../../services/animal/animal.service.js';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "../shared/header/header/header.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnimalFormComponent } from './animal-form/animal-form.component.js';
import { RouterLink } from '@angular/router';
import { AnimalFilterPipe } from '../../pipes/animal-filter.pipe.js';
@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule,  RouterLink, AnimalFilterPipe, FormsModule],
  templateUrl: './animal.component.html',
  styleUrl: './animal.component.css'
})
export class AnimalComponent {
  breeds: string  = ''; 
  rescue: string  = ''; 
  index: any;

  constructor(public animalService: AnimalService) { 

  }
  ngOnInit(): void {
    this.getAnimals();
  }
  
getAnimals() {
  this.animalService.getAnimals().subscribe({
    next: (response) => {
      this.animalService.animals = response.data;
      console.log(this.animalService.animals);
    },
    error: (error) => console.log(error)
  });
}
  deleteAnimal(id: number){
    this.animalService.deleteAnimal(id).subscribe({
      next: (response) => {
       console.log(response);
       this.getAnimals();
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  BACKEND_BASE = 'http://localhost:3000';

  getPhotoUrl(animal: any): string {
    const url = animal?.photos?.length ? animal.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }
}
