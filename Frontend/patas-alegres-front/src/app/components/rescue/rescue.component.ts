import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RescueFormComponent } from './rescue-form/rescue-form.component'; // ajustá ruta si hace falta
import { RescueService } from '../../services/rescue/rescue.service';
import { ShelterService } from '../../services/shelter/shelter.service';
import { BreedService } from '../../services/breed/breed.service';
import { ViewChild } from '@angular/core';

import { AnimalLite, Rescue } from '../../models/rescue/rescue.model';

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

  saving = false;

  /** ✅ Animales cargados (columna derecha) */
  animals: AnimalLite[] = [];

  /** ✅ Mini form del Modal */
  animalForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    birth_date: new FormControl<string>(''),
    breedId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  constructor(
    private rescueService: RescueService,
    //private cityService: CityService,
    private shelterService: ShelterService,
    private breedService: BreedService,
  ) {}

  @ViewChild(RescueFormComponent) rescueFormComp!: RescueFormComponent;

  submitRescueFromParent(): void {
    this.rescueFormComp.onSubmit(); // llama al submit del hijo
  }

  ngOnInit(): void {
    //this.loadCities();
    this.loadShelters();
    this.loadBreeds();
  }

 /* loadCities(): void {
    this.cityService.getCities().subscribe({
      next: (resp: any) => (this.cities = resp?.data ?? resp ?? []),
      error: (err: any) => console.log(err),
    });
  }*/

  loadShelters(): void {
    this.shelterService.getShelters().subscribe({
      next: (resp: any) => (this.shelters = resp?.data ?? resp ?? []),
      error: (err: any) => console.log(err),
    });
  }

  loadBreeds(): void {
    this.breedService.getBreeds().subscribe({
      next: (resp: any) => (this.breeds = resp?.data ?? resp ?? []),
      error: (err: any) => console.log(err),
    });
  }

  /** ✅ recibe el payload del form (solo datos rescate) y agrega animals antes de POST */
  createRescue(rescuePayload: Rescue): void {
    if (this.animals.length === 0) {
      alert('Tenés que agregar al menos un animal.');
      return;
    }

    const payload: any = {
      ...rescuePayload,
      animals: this.animals,
    };

    this.saving = true;

    // Ajustá si tu método se llama distinto
    this.rescueService.postRescue(payload).subscribe({
      next: (resp: any) => {
        this.saving = false;
        alert('✅ Rescate creado');
        console.log(resp);

        // reset UI
        this.animals = [];
        this.animalForm.reset({ name: '', birth_date: '', breedId: null });
      },
      error: (err: any) => {
        this.saving = false;
        console.log(err);
        alert(err?.error?.message ?? 'Error creando rescate');
      }
    });
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
      Number(v.breedId)
    ));

    // reseteo
    this.animalForm.reset({ name: '', birth_date: '', breedId: null });
  }

  removeAnimal(index: number): void {
    this.animals.splice(index, 1);
  }
}