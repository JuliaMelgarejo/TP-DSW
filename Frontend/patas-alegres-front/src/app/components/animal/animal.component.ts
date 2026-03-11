import { Component } from '@angular/core';
import { AnimalService } from '../../services/animal/animal.service.js';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AnimalFilterPipe } from '../../pipes/animal-filter.pipe.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AnimalFilterPipe, FormsModule],
  templateUrl: './animal.component.html',
  styleUrl: './animal.component.css'
})
export class AnimalComponent {
  breeds: string = '';
  rescue: string = '';
  index: any;
  loading = true;
  shelterIdFilter: number | null = null;

  BACKEND_BASE = 'http://localhost:3000';

  constructor(
    public animalService: AnimalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const shelterId = Number(params.get('shelterId'));

      if (shelterId && !Number.isNaN(shelterId)) {
        this.shelterIdFilter = shelterId;
        this.getAnimalsByShelter(shelterId);
      } else {
        this.shelterIdFilter = null;
        this.getAnimals();
      }
    });
  }

  getAnimals() {
    this.loading = true;

    this.animalService.getAnimals().subscribe({
      next: (response) => {
        this.animalService.animals = response.data;
        this.loading = false;
        console.log(this.animalService.animals);
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  getAnimalsByShelter(shelterId: number) {
    this.loading = true;

    this.animalService.getAnimalsByShelter(shelterId).subscribe({
      next: (response) => {
        this.animalService.animals = response.data;
        this.loading = false;
        console.log(this.animalService.animals);
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  deleteAnimal(id: number) {
    this.animalService.deleteAnimal(id).subscribe({
      next: (response) => {
        console.log(response);

        if (this.shelterIdFilter) {
          this.getAnimalsByShelter(this.shelterIdFilter);
        } else {
          this.getAnimals();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  getPhotoUrl(animal: any): string {
    const url = animal?.photos?.length ? animal.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  getTitle(): string {
    return this.shelterIdFilter
      ? 'Animales de este refugio'
      : 'Lista de animales esperando TU rescate';
  }

  getSubtitle(): string {
    return this.shelterIdFilter
      ? 'Listado filtrado por refugio'
      : 'lista de animales';
  }

  getBackLink(): string {
    return this.shelterIdFilter ? `/shelters/${this.shelterIdFilter}` : '/home';
  }
}