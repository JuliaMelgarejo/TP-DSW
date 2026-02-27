import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SignInStateService } from '../../../services/sign-in-state/sign-in-state.service.js';
import { UserService } from '../../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../../services/errors/error.service.js';
import { PersonService } from '../../../services/person/person.service.js';
import { City } from '../../../models/city/city.module.js';
import { Province } from '../../../models/province/province.module.js';
import { Country } from '../../../models/country/country.module.js';
import { CityService } from '../../../services/city/city.service.js';
import { ProvinceService } from '../../../services/province/province.service.js';
import { CountryService } from '../../../services/country/country.service.js';

@Component({
  selector: 'app-sign-in-shelter-details',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
    ],
  templateUrl: './sign-in-shelter-details.component.html'
})
export class SignInShelterDetailsComponent {

  ShelterForm: FormGroup;
  cities: City[] = [];
  provinces: Province[] = [];
  countries: Country[] = [];
  selectedProvince!: number;
  selectedCountry!: number;

  constructor(
    private fb: FormBuilder,
    private state: SignInStateService,
    private userService: UserService,
    private router: Router,
    public errorService: ErrorService,
    public personService: PersonService,
    public cityService: CityService,
    public provinceService: ProvinceService,
    public countryService: CountryService
  ) {
    this.ShelterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [''],
      tuitionVet: [''],
      street: [''],
      streetNumber: [0],
      max_capacity: [0],
      city: ['', Validators.required],
    });
  }

  
  ngOnInit(): void {
    this.loadCountries();

    // Cuando cambia país
    this.ShelterForm.get('address.country')?.valueChanges.subscribe(countryId => {

      if (!countryId) {
        this.provinces = [];
        this.cities = [];
        return;
      }

      this.provinceService.getByCountry(countryId)
        .subscribe(res => {
          this.provinces = res.data;
          this.cities = [];
        });
    });

    // Cuando cambia provincia
    this.ShelterForm.get('address.province')?.valueChanges.subscribe(provinceId => {

      if (!provinceId) {
        this.cities = [];
        return;
      }

      this.cityService.getByProvince(provinceId)
        .subscribe(res => {
          this.cities = res.data;
        });
    });
  }
     

  loadCountries() {
    this.countryService.getCountries().subscribe({
      next: (data) => {
        this.countries = data.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  onCountryChange() {
    this.selectedProvince = 0;
    this.cities = [];
    this.provinceService.getByCountry(this.selectedCountry).subscribe({
      next: (data) => {
        this.provinces = data.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onProvinceChange() {
    this.cityService.getByProvince(this.selectedProvince).subscribe({

      next: (res) => {
        this.cities = res.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  finish() {

    const account = this.state.getAccount();
    console.log("State: ", this.state);
    console.log("Account: ", account);

    const payload = {
      ...account,
      role: 'SHELTER',
      shelter: this.ShelterForm.value
    };

    this.userService.signIn(payload).subscribe(() => {
      alert('Usuario y refugio creado exitosamente');
      this.state.clear();
      this.router.navigate(['/login']);
    });
  }
}