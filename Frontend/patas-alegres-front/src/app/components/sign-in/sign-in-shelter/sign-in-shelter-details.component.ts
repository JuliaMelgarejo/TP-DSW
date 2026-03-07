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
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-sign-in-shelter-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AddressPickerComponent
],
  templateUrl: './sign-in-shelter-details.component.html'
})
export class SignInShelterDetailsComponent {
  ShelterForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private state: SignInStateService,
    private userService: UserService,
    private router: Router,
    public errorService: ErrorService,
    public personService: PersonService,
  ) {
    this.ShelterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [''],
      tuitionVet: [''],
      max_capacity: [0],
      address: new FormGroup({
        latitude: new FormControl('', [Validators.required]),
        longitude: new FormControl('', [Validators.required]),
        province: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        formattedAddress: new FormControl(''),
        placeId: new FormControl(''),
        street: new FormControl(''),
        streetNumber: new FormControl(''),
        postalCode: new FormControl(''),
        country: new FormControl('', [Validators.required])
      })
    });
  }     

  get addressForm(): FormGroup {
    return this.ShelterForm.get('address') as FormGroup;
  }

  finish() {
    const account = this.state.getAccount();
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