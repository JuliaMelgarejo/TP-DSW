import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { AnimalService } from '../../../services/animal/animal.service.js';
import { PhotoService } from '../../../services/photo/photo.service';
import { Animal } from '../../../models/animal/animal.model.js';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-animal-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './animal-details.component.html',
  styleUrl: './animal-details.component.css'
})
export class AnimalDetailsComponent {

  selectedAnimal: any;

  animalForm: FormGroup;
  name: FormControl;
  birth_date: FormControl;
  breed: FormControl;
  rescueClass: FormControl;

  // Upload state
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadError: string | null = null;

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    public animalService: AnimalService,
    private photoService: PhotoService,
    private toast: ToastNotificationService
  ){
    this.name = new FormControl('', [Validators.required]);
    this.birth_date = new FormControl('');
    this.breed = new FormControl('');
    this.rescueClass = new FormControl('');

    this.animalForm = new FormGroup({
      name: this.name,
      birth_date: this.birth_date,
      breed: this.breed,
      rescueClass: this.rescueClass
    })
  }

  ngOnInit(): void {
    const animalid = Number(this.route.snapshot.params['id']);
    this.getAnimal(animalid);
  }

  getAnimal(id: number) {
    this.animalService.getAnimal(id).subscribe({
      next: (res) => {
        const animal = res.data;
        this.selectedAnimal = animal;

        this.animalForm.patchValue({
          name: animal.name,
          birth_date: this.formatInputDate(animal.birth_date),
          breed: animal.breed?.name,
          rescueClass: animal.rescueClass?.rescue_date
        });
      },
      error: (e) => this.toast.show(e.error.msg, 'danger')
    });
  }

  updateAnimal() {
    if (!this.selectedAnimal?.id) return;

    const payload = {
      name: this.animalForm.value.name,
      birth_date: this.animalForm.value.birth_date,
    };

    // OJO: tu service arma la URL con animal.id, así que pasamos id afuera
    this.animalService.updateAnimal({ ...(payload as any), id: this.selectedAnimal.id }).subscribe({
      next: () => this.getAnimal(this.selectedAnimal.id),
      error: (e) => this.toast.show(e.error.msg, 'danger'),
    });
  }

  // ======================
  // FOTO
  // ======================

  onFileChange(event: Event){
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;

    if(this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  uploadPhoto(){
    if(!this.selectedAnimal?.id || !this.selectedFile) return;

    this.uploading = true;

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
    })
  }

  getMainPhotoUrl(){
    const url = this.selectedAnimal?.photos?.length ? this.selectedAnimal.photos[0].url : null;
    if(!url) return null;
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  formatInputDate(date:any){
    if(!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0,10);
  }

  deletePhoto(photoId: number) {
  if (!this.selectedAnimal?.id) return;

  const ok = confirm('¿Eliminar esta foto?');
  if (!ok) return;

  this.photoService.deletePhoto(photoId).subscribe({
    next: () =>{ this.getAnimal(this.selectedAnimal.id);
      this.previewUrl = null;
      this.selectedFile = null;
  },
    error: (e) => this.toast.show(e.error.msg, 'danger'),
  });
}

getPhotoUrl(p: any): string {
  const url = p?.url;
  if (!url) return 'assets/nophoto.png';
  return url.startsWith('http') ? url : this.BACKEND_BASE + url;
}
}