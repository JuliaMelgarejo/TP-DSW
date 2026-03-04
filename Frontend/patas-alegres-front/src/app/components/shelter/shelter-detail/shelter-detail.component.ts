import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShelterService } from '../../../services/shelter/shelter.service.js';
import { Shelter } from '../../../models/shelter/shelter.model.js';
import { CountryService } from '../../../services/country/country.service.js';
import { ProvinceService } from '../../../services/province/province.service.js';
import { CityService } from '../../../services/city/city.service.js';
import { Country } from '../../../models/country/country.module.js';
import { Province } from '../../../models/province/province.module.js';
import { City } from '../../../models/city/city.module.js';
import { AuthService } from '../../../services/auth/auth.service.js';

@Component({
  selector: 'app-shelter-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shelter-detail.component.html',
  styleUrl: './shelter-detail.component.css'
})
export class ShelterDetailComponent {
  shelterForm: FormGroup;
  selectedShelter!: Shelter;
  countries: Country[] = [];
  provinces: Province[] = [];
  cities: City[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public shelterService: ShelterService,
    public countryService: CountryService,
    public provinceService: ProvinceService,
    public cityService: CityService,
    public auth: AuthService,
  ) {

    this.shelterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      tuitionVet: ['', Validators.required],
      street: ['', Validators.required],
      streetNumber: ['', Validators.required],
      max_capacity: ['', Validators.required],

      country: [{ value: null, disabled: true }, Validators.required],
      province: [{ value: null, disabled: true }, Validators.required],
      city: [{ value: null, disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    const idFromRoute = Number(this.route.snapshot.paramMap.get('id'));
    const id = idFromRoute ? Number(idFromRoute) : this.auth.getShelterIdToken();
    this.loadCountries();
    if (id) {
      this.getShelter(id);
    }
  }

  getShelter(id: number) {
    this.shelterService.getShelter(id).subscribe({
      next: (res) => {
        this.selectedShelter = res.data;

        this.shelterForm.patchValue({
          name: this.selectedShelter.name,
          phoneNumber: this.selectedShelter.phoneNumber,
          tuitionVet: this.selectedShelter.tuitionVet,
          street: this.selectedShelter.street,
          streetNumber: this.selectedShelter.streetNumber,
          max_capacity: this.selectedShelter.max_capacity,
          country: [{ value: null, disabled: true }, Validators.required],
          province: [{ value: null, disabled: true }, Validators.required],
          city: [{ value: null, disabled: true }, Validators.required],
        });
        console.log('Shelter obtenido:', this.selectedShelter);
        this.loadLocationHierarchy(this.selectedShelter.city);
      }
    });
  }

  updateShelter() {
    const updated = {
      ...this.shelterForm.value,
      id: this.selectedShelter.id,
      city: this.shelterForm.get('city')?.value
    };

    this.shelterService.updateShelter(updated).subscribe({
      next: () => console.log('Refugio actualizado')
    });
  }

  loadCountries() {
    this.countryService.getCountries().subscribe(res => {
      this.countries = res.data;
      this.shelterForm.get('country')?.enable();
    });
  }

  onCountryChange() {
    const countryId = this.shelterForm.get('country')?.value;

    this.provinceService.getByCountry(countryId).subscribe(res => {
      this.provinces = res.data;
      this.shelterForm.get('province')?.enable();
      this.shelterForm.get('city')?.disable();
      this.cities = [];
    });
  }

  onProvinceChange() {
    const provinceId = this.shelterForm.get('province')?.value;

    this.cityService.getByProvince(provinceId).subscribe(res => {
      this.cities = res.data;
      this.shelterForm.get('city')?.enable();
    });
  }

  loadLocationHierarchy(cityId: number) {
    this.cityService.getCity(cityId).subscribe(cityRes => {
      const city = cityRes.data;
      console.log('Ciudad obtenida:', cityRes);
      this.provinceService.getProvince(city.province).subscribe(provRes => {

        const province = provRes.data;
        console.log('Provincia obtenida:', province);

        this.shelterForm.patchValue({
          country: province.country,
          province: province.id,
          city: city.id
        });

        this.shelterForm.get('country')?.enable();
        this.shelterForm.get('province')?.enable();
        this.shelterForm.get('city')?.enable();

        this.provinceService.getByCountry(province.country).subscribe(p => {
          this.provinces = p.data;
        });

        this.cityService.getByProvince(province.id).subscribe(c => {
          this.cities = c.data;
        });

      });
    });
  }
}