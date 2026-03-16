import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RescueFormComponent } from './rescue-form/rescue-form.component'; // ajustá ruta si hace falta
import { RescueService } from '../../services/rescue/rescue.service';
import { ShelterService } from '../../services/shelter/shelter.service';
import { BreedService } from '../../services/breed/breed.service';
import { ViewChild } from '@angular/core';

import { AnimalLite, Rescue } from '../../models/rescue/rescue.model';
import { AuthService } from '../../services/auth/auth.service';
import { PhotoService } from '../../services/photo/photo.service';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service.js';
type Option = { id: number; name: string };

@Component({
  selector: 'app-rescue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RescueFormComponent],
  templateUrl: './rescue.component.html',
  styleUrl: './rescue.component.css',
})
export class RescueComponent {
  cities: Option[] = [];
  shelters: Option[] = [];
  breeds: Option[] = [];
  selectedAnimalFile: File | null = null;
  selectedAnimalPreview: string | null = null;

  saving = false;

  /** ✅ Animales cargados (columna derecha) */
  animals: AnimalLite[] = [];

  /** ✅ Mini form del Modal */
  animalForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    birth_date: new FormControl<string>(''),
    description : new FormControl<string>(''),
    breedId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  constructor(
    private rescueService: RescueService,
    private shelterService: ShelterService,
    private breedService: BreedService,
    private authService: AuthService,
    private photoService: PhotoService,
    private toast: ToastNotificationService
  ) {}

  @ViewChild(RescueFormComponent) rescueFormComp!: RescueFormComponent;

  submitRescueFromParent(): void {
    this.rescueFormComp.onSubmit(); // llama al submit del hijo
  }

  ngOnInit(): void {
    this.loadShelters();
    this.loadBreeds();
    
  }


  loadShelters(): void {
    this.shelterService.getShelters().subscribe({
      next: (resp: any) => (this.shelters = resp?.data ?? resp ?? []),
      error: (e) => this.toast.show(e.error.msg, 'danger'),
    });
  }

  loadBreeds(): void {
    this.breedService.getBreeds().subscribe({
      next: (resp: any) => (this.breeds = resp?.data ?? resp ?? []),
      error: (e) => this.toast.show(e.error.msg, 'danger'),
    });
  }

  /** ✅ recibe el payload del form (solo datos rescate) y agrega animals antes de POST */
  createRescue(formData: any) {
    const shelterId = this.authService.getShelterIdToken();
    if (!shelterId) {
      this.toast.show('No se encontró el refugio asociado.', 'info')
      return;
    }
    if (this.animals.length === 0) {
      this.toast.show('Tenés que agregar al menos un animal.', 'info')
      return;
    }

    const payload = {
      rescue_date: formData.rescue_date,
      description: formData.description ?? '',
      comments: formData.comments ?? '',
      address: formData.address,
      shelters: shelterId,
      animals: this.animals.map(a => ({
        name: a.name,
        birth_date: a.birth_date,
        description: a.description,
        breed: a.breed
      }))
    };

  this.rescueService.postRescue(payload).subscribe({
    next: (resp: any) => {

      this.toast.show('Rescate creado correctamente: ' + resp, 'success')

      // 🔥 1) Obtener animales creados desde el backend
      const createdAnimals = resp?.data?.animals ?? [];

      // 🔥 2) Subir fotos si existen
      this.animals.forEach((local, i) => {
        const created = createdAnimals[i];

        if (local.photoFile && created?.id) {
          this.photoService
            .uploadAnimalPhoto(created.id, local.photoFile)
            .subscribe({
              next: () => this.toast.show('Foto subida para el animal ' + created.id , 'success'),
              error: (e) => this.toast.show(e.error.msg, 'danger')
            });
        }
      });

      this.toast.show('Rescate creado correctamente', 'success')

      // 🔥 3) Limpiar estado
      this.animals = [];
    },

    error: (e) => {
      this.toast.show(e.error.msg, 'danger')
    }
  });
  }

onAnimalPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;

  this.selectedAnimalFile = file;

  if (this.selectedAnimalPreview) URL.revokeObjectURL(this.selectedAnimalPreview);
  this.selectedAnimalPreview = file ? URL.createObjectURL(file) : null;
}

  /** ✅ modal: agregar animal */
  addAnimalFromModal(): void {
    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      return;
    }

    const v = this.animalForm.getRawValue();

    this.animals.push(new AnimalLite(
    v.name,
    v.birth_date || null,
    v.description ?? '',
    Number(v.breedId),
    this.selectedAnimalFile,        // ✅ foto opcional
    this.selectedAnimalPreview 
    ));

    // reseteo
    this.animalForm.reset({ name: '', birth_date: '', description: '', breedId: null });
    this.selectedAnimalFile = null;
    this.selectedAnimalPreview = null;
  }

  removeAnimal(index: number): void {
    this.animals.splice(index, 1);
  }
}