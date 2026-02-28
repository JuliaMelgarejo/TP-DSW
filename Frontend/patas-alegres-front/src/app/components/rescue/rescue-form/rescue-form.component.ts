import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProvinceService } from '../../../services/province/province.service';
import { CityService } from '../../../services/city/city.service';
import { CountryService } from '../../../services/country/country.service';

import { Province } from '../../../models/province/province.module';
import { Country } from '../../../models/country/country.module';
import { City } from '../../../models/city/city.module';

@Component({
  selector: 'app-rescue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './rescue-form.component.html',
  styleUrl: './rescue-form.component.css',
})
export class RescueFormComponent implements OnInit {

  @Output() submitRescue = new EventEmitter<any>();

  // Dropdowns estilo SignIn
  countries: Country[] = [];
  provinces: Province[] = [];
  cities: City[] = [];

  selectedCountry: number = 0;
  selectedProvince: number = 0;

  // Form SOLO datos rescate
  rescueForm = new FormGroup({
    rescue_date: new FormControl('', { validators: [Validators.required] }),
    cityId: new FormControl('', { validators: [Validators.required] }),
    street: new FormControl('', { validators: [Validators.required] }),
    number_street: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl(''),
    comments: new FormControl(''),
  });

  constructor(
    public cityService: CityService,
    public provinceService: ProvinceService,
    public countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe({
      next: (res: any) => {
        this.countries = res?.data ?? [];
      },
      error: (err: any) => console.log(err),
    });
  }

  onCountryChange(): void {
    // reset cascada
    this.selectedProvince = 0;
    this.provinces = [];
    this.cities = [];
    this.rescueForm.patchValue({ cityId: '' });

    if (!this.selectedCountry || this.selectedCountry === 0) return;

    this.provinceService.getByCountry(this.selectedCountry).subscribe({
      next: (res: any) => {
        this.provinces = res?.data ?? [];
      },
      error: (err: any) => console.log(err),
    });
  }

  onProvinceChange(): void {
    // reset ciudades
    this.cities = [];
    this.rescueForm.patchValue({ cityId: '' });

    if (!this.selectedProvince || this.selectedProvince === 0) return;

    this.cityService.getByProvince(this.selectedProvince).subscribe({
      next: (res: any) => {
        this.cities = res?.data ?? [];
      },
      error: (err: any) => console.log(err),
    });
  }

  onSubmit(): void {
    if (this.rescueForm.invalid) {
      this.rescueForm.markAllAsTouched();
      return;
    }

    const v: any = this.rescueForm.value;

    const formPayload = {
      rescue_date: v.rescue_date,
      description: v.description ?? '',
      comments: v.comments ?? '',
      street: v.street,
      number_street: v.number_street,
      cityId: Number(v.cityId),
    };

    if (!v.number_street || Number.isNaN(Number(v.number_street))) {
    alert('Número de calle inválido');
    return;
}

    this.submitRescue.emit(formPayload);
  }
}