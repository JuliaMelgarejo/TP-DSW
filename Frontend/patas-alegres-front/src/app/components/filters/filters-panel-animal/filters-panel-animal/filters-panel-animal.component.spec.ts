import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export type SortKey = 'breed' | 'rescueDate' | 'age' | 'zone';

export interface FiltersValue {
  sortBy: SortKey;
  breedIds: number[];
  shelterIds: number[];
  zoneIds: number[];
  minAge?: number | null;
  maxAge?: number | null;
  rescueFrom?: string | null; // yyyy-mm-dd
  rescueTo?: string | null;   // yyyy-mm-dd
}

export interface FilterOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-filters-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.css',
})
export class FiltersPanelComponent {
  @Input() appliedChips: string[] = []; // si querés mostrar chips “Perro”, “Córdoba”, etc.

  @Input() breeds: FilterOption[] = [];
  @Input() shelters: FilterOption[] = [];
  @Input() zones: FilterOption[] = [];

  @Input() totalFound: number | null = null; // “68 animales encontrados”

  @Output() apply = new EventEmitter<FiltersValue>();
  @Output() clear = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      sortBy: this.fb.control<SortKey>('breed'),
      breedIds: this.fb.control<number[]>([]),
      shelterIds: this.fb.control<number[]>([]),
      zoneIds: this.fb.control<number[]>([]),
      minAge: this.fb.control<number | null>(null),
      maxAge: this.fb.control<number | null>(null),
      rescueFrom: this.fb.control<string | null>(null),
      rescueTo: this.fb.control<string | null>(null),
    });
  }

  // helpers para checkboxes multi-select
  toggleId(controlName: string, id: number) {
    const current: number[] = this.form.value[controlName] ?? [];
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    this.form.patchValue({ [controlName]: next });
  }

  hasId(controlName: string, id: number): boolean {
    const current: number[] = this.form.value[controlName] ?? [];
    return current.includes(id);
  }

  onApply() {
    const v = this.form.value as FiltersValue;
    this.apply.emit({
      sortBy: v.sortBy,
      breedIds: v.breedIds ?? [],
      shelterIds: v.shelterIds ?? [],
      zoneIds: v.zoneIds ?? [],
      minAge: v.minAge ?? null,
      maxAge: v.maxAge ?? null,
      rescueFrom: v.rescueFrom ?? null,
      rescueTo: v.rescueTo ?? null,
    });
  }

  onClear() {
    this.form.reset({
      sortBy: 'breed',
      breedIds: [],
      shelterIds: [],
      zoneIds: [],
      minAge: null,
      maxAge: null,
      rescueFrom: null,
      rescueTo: null,
    });
    this.clear.emit();
  }
}