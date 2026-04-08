import { Component } from '@angular/core';
import { AnimalService } from '../../services/animal/animal.service';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AnimalFilterPipe } from '../../pipes/animal-filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Animal } from '../../models/animal/animal.model';
import { Shelter } from '../../models/shelter/shelter.model';
import { AnimalFilters } from '../../models/animal/animal-filters';
import { AuthService } from '../../services/auth/auth.service';
import { ShelterService } from '../../services/shelter/shelter.service';
import { BreedService } from '../../services/breed/breed.service';
import { Breed } from '../../models/breed/breed.model';
import { AppConfig } from '../../core/config/app.config.js';

@Component({
  selector: 'app-animal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AnimalFilterPipe, FormsModule],
  templateUrl: './animal.component.html',
  styleUrl: './animal.component.css'
})
export class AnimalComponent {
  rescue: string = '';
  index: any;
  loading = true;
  shelterIdFilter: number | null = null;
  animals: Animal[] = [];
  totalAnimals: number = 0;
  totalPages: number = 1;
  filters: AnimalFilters = {
    page: 1,
    limit: 12
  };
  shelters: Shelter[] = [];
  breeds: Breed[] = [];
  isShelter: boolean;

  readonly BACKEND_BASE = `${AppConfig.apiBase}`;

  constructor(
    public animalService: AnimalService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private shelterService: ShelterService,
    private breedService: BreedService,
    public router: Router,
  ) {
    this.isShelter = this.auth.isShelter();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        page: Number(params['page']) || 1,
        limit: Number(params['limit']) || 12,
        shelterId: params['shelterId'] ? Number(params['shelterId']) : undefined,
        breedId: params['breedId'] ? Number(params['breedId']) : undefined,
        minRescueDate: params['minRescueDate'] ? Number(params['minRescueDate']) : undefined,
        maxRescueDate: params['maxRescueDate'] ? Number(params['maxRescueDate']) : undefined,
        sort: params['sort'] ?? undefined,
      };
      this.loadAnimals();
    });
    this.loadFilters();
  }

  getPhotoUrl(animal: any): string {
    const url = animal?.photos?.length ? animal.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  getTitle(): string {
    return this.isShelter
      ? 'Animales de este refugio'
      : 'Lista de animales esperando TU rescate';
  }

  getSubtitle(): string {
    return this.isShelter
      ? 'Listado filtrado por refugio'
      : 'lista de animales';
  }

  getBackLink(): string {
    return this.isShelter ? `/shelters/${this.shelterIdFilter}` : '/home';
  }
  

  loadAnimals() {
    this.loading = true;
    const query: AnimalFilters = { ...this.filters };
    if (this.isShelter) {
      query.shelterId = this.auth.getShelterIdToken();
    }
    this.animalService.getAnimals(query).subscribe(res => {
      this.animals = res.data;
      this.totalAnimals = res.total;
      this.totalPages = res.totalPages;
      this.loading = false;
    });
    if (this.filters.page! > this.totalPages && this.totalPages > 0) {
      this.goToPage(this.totalPages);
    }
  }

  loadFilters(){ // paginar
    this.breedService.getBreeds().subscribe(res => {
      this.breeds = res.data;
    });
    if (!this.auth.isShelter()){
      this.shelterService.getShelters().subscribe(res => {
        this.shelters = res.data;
      });
    }
  }

  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  applyFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filters,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  get page(): number {
    return this.filters.page ?? 1;
  }

  removeFilter(type: string) {
    if (type === 'shelter') {
      this.filters.shelterId = undefined;
    }
    if (type === 'breed') {
      this.filters.breedId = undefined;
    }
    if (type === 'sort') {
      this.filters.sort = undefined;
    }

    this.applyFilters()
  }

  getShelterName(id?: number) {
    return this.shelters.find(s => s.id === id)?.name;
  }

  getBreedName(id?: number) {
    return this.breeds.find(c => c.id === id)?.name;
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        limit: 12,
        shelterId: null,
        breedId: null,
        sort: null,
        minPrice: null,
        maxPrice: null
      }
    });
    this.loadAnimals();
  }

  get pages(): number[] {
    const max = 5
    const start = Math.max(this.page - 2, 1)
    const end = Math.min(start + max - 1, this.totalPages)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }
}