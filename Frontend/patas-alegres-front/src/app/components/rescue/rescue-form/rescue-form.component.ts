import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rescue, AnimalLite } from '../../../models/rescue/rescue.model';

type Option = { id: number; name: string };

@Component({
  selector: 'app-rescue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rescue-form.component.html',
  styleUrl: './rescue-form.component.css',
})
export class RescueFormComponent {
  @Input() shelters: Option[] = [];
  @Input() cities: Option[] = [];
  @Input() breeds: Option[] = []; // ✅

  @Output() submitRescue = new EventEmitter<Rescue>();

  rescueForm = new FormGroup({
    rescue_date: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    cityId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    shelterId: new FormControl<number | null>(null, { validators: [Validators.required] }),

    street: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    number_street: new FormControl<number | null>(null, { validators: [Validators.required] }),

    description: new FormControl<string>('', { nonNullable: true }),
    comments: new FormControl<string>('', { nonNullable: true }),
  });

  animals: AnimalLite[] = [];

  // ✅ mini form: ahora breedId es obligatorio si querés
  animalForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    birth_date: new FormControl<string>(''),
    breedId: new FormControl<number | null>(null, { validators: [Validators.required] }), // ✅ dropdown
  });

  addAnimalFromMiniForm(): void {
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

    this.animalForm.reset({ name: '', birth_date: '', breedId: null });
  }

  removeAnimal(index: number): void {
    this.animals.splice(index, 1);
  }

  onSubmit(): void {
    if (this.rescueForm.invalid) {
      this.rescueForm.markAllAsTouched();
      return;
    }
    if (this.animals.length === 0) {
      alert('Tenés que agregar al menos un animal.');
      return;
    }

    const v = this.rescueForm.getRawValue();

    const payload = new Rescue(
      null,
      v.rescue_date,
      v.description ?? '',
      v.comments ?? '',
      v.street,
      Number(v.number_street),
      Number(v.shelterId),
      Number(v.cityId),
      this.animals
    );

    this.submitRescue.emit(payload);
  }
}