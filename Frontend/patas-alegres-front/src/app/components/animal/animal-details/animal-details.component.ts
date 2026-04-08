import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { AnimalService } from '../../../services/animal/animal.service';
import { BreedService } from '../../../services/breed/breed.service';
import { PhotoService } from '../../../services/photo/photo.service';

import { Animal } from '../../../models/animal/animal.model';
import { Breed } from '../../../models/breed/breed.model';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-animal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './animal-details.component.html',
  styleUrl: './animal-details.component.css'
})
export class AnimalDetailsComponent {
  selectedAnimal: any = null;

  animalForm: FormGroup;
  name: FormControl;
  birth_date: FormControl;
  breed: FormControl;
  rescueClass: FormControl;

  breeds: Breed[] = [];
  selectedBreedName = 'Seleccionar raza';
  breedDropdownOpen = false;

  // Upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadError: string | null = null;

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    public animalService: AnimalService,
    private breedService: BreedService,
    private photoService: PhotoService
  ) {
    this.name = new FormControl('', [Validators.required]);
    this.birth_date = new FormControl('');
    this.breed = new FormControl(null);
    this.rescueClass = new FormControl('');

    this.animalForm = new FormGroup({
      name: this.name,
      birth_date: this.birth_date,
      breed: this.breed,
      rescueClass: this.rescueClass
    });
  }

  ngOnInit(): void {
    const animalId = Number(this.route.snapshot.params['id']);
    this.loadBreeds();
    this.getAnimal(animalId);
  }

  loadBreeds() {
    this.breedService.getBreeds().subscribe({
      next: (response) => {
        this.breeds = response.data ?? [];
        this.updateSelectedBreedName();
        console.log('Razas cargadas:', this.breeds);
      },
      error: (error) => console.log('Error cargando razas:', error)
    });
  }

  getAnimal(id: number) {
    this.animalService.getAnimal(id).subscribe({
      next: (value: any) => {
        const animal = value?.data ?? value;
        this.selectedAnimal = animal;

        console.log('Animal completo:', animal);
        console.log('animal.breed:', animal.breed);

        this.animalForm.patchValue({
          name: animal.name ?? '',
          birth_date: this.formatInputDate(animal.birth_date),
          breed: animal.breed ?? null,
          rescueClass: animal.rescueClass ?? ''
        });

        this.updateSelectedBreedName();

        console.log('Formulario:', this.animalForm.value);
      },
      error: (error) => console.log('Error cargando animal:', error)
    });
  }

  toggleBreedDropdown(event: Event) {
    event.stopPropagation();
    this.breedDropdownOpen = !this.breedDropdownOpen;
  }

  selectBreed(breed: Breed, event?: Event) {
    event?.stopPropagation();

    this.animalForm.patchValue({
      breed: breed.id
    });

    this.selectedBreedName = breed.name;
    this.breedDropdownOpen = false;

    console.log('Raza seleccionada en formulario:', this.animalForm.value.breed);
  }

  updateSelectedBreedName() {
    const selectedBreedId = this.animalForm.value.breed;

    if (selectedBreedId == null || this.breeds.length === 0) {
      this.selectedBreedName = 'Seleccionar raza';
      return;
    }

    const selectedBreed = this.breeds.find(
      b => Number(b.id) === Number(selectedBreedId)
    );

    this.selectedBreedName = selectedBreed
      ? selectedBreed.name
      : 'Seleccionar raza';
  }

  @HostListener('document:click')
  closeDropdown() {
    this.breedDropdownOpen = false;
  }

  updateAnimal() {
    if (!this.selectedAnimal?.id) return;

    const payload: any = {
      id: this.selectedAnimal.id,
      name: this.animalForm.value.name,
      birth_date: this.animalForm.value.birth_date,
      breedId: this.animalForm.value.breed
    };

    console.log('Payload a enviar:', payload);

    this.animalService.updateAnimal(payload).subscribe({
      next: (resp) => {
        console.log('Animal actualizado:', resp);
        this.getAnimal(this.selectedAnimal.id);
      },
      error: (error) => console.log('Error actualizando animal:', error)
    });
  }

  // ======================
  // FOTO
  // ======================

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  uploadPhoto() {
    if (!this.selectedAnimal?.id || !this.selectedFile) return;

    this.uploading = true;
    this.uploadError = null;

    this.photoService.uploadAnimalPhoto(this.selectedAnimal.id, this.selectedFile).subscribe({
      next: () => {
        this.uploading = false;
        this.previewUrl = null;
        this.selectedFile = null;
        this.getAnimal(this.selectedAnimal.id);
      },
      error: (err) => {
        this.uploading = false;
        this.uploadError = err?.error?.message ?? 'Error subiendo foto';
      }
    });
  }

  getMainPhotoUrl() {
    const url = this.selectedAnimal?.photos?.length
      ? this.selectedAnimal.photos[0].url
      : null;

    if (!url) return null;

    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  formatInputDate(date: any) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }

  deletePhoto(photoId: number) {
    if (!this.selectedAnimal?.id) return;

    const ok = confirm('¿Eliminar esta foto?');
    if (!ok) return;

    this.photoService.deletePhoto(photoId).subscribe({
      next: () => {
        this.getAnimal(this.selectedAnimal.id);
        this.previewUrl = null;
        this.selectedFile = null;
      },
      error: (err) => console.log(err)
    });
  }

  getPhotoUrl(p: any): string {
    const url = p?.url;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }
}