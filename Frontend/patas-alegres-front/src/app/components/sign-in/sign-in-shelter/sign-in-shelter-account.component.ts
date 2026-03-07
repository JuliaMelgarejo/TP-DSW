import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule,FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { SignInStateService } from '../../../services/sign-in-state/sign-in-state.service.js';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-sign-in-shelter-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AddressPickerComponent
],
  templateUrl: './sign-in-shelter-account.component.html'
})
export class SignInShelterAccountComponent {
[x: string]: any;
  UserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private state: SignInStateService,
    public userService: UserService, 
    public errorService: ErrorService,
    public personService: PersonService,
    public router: Router
  ) {
    this.UserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      person: this.fb.group({
        name: ['', [Validators.required]],
        surname: ['', [Validators.required]],
        doc_type: ['', [Validators.required]],
        doc_nro: ['', [Validators.required]],
        email: [''],
        phoneNumber: [''],
        birthdate: [''],
        nroCuit: [''],
        address: this.fb.group({
          latitude: ['', [Validators.required]],
          longitude: ['', [Validators.required]],
          province: [''],
          city: [''],
          formattedAddress: [''],
          placeId: [''],
          street: [''],
          streetNumber: [''],
          postalCode: [''],
          country: ['']
        })
      })
    })
  }

  get addressForm(): FormGroup {
    return this.UserForm.get('person.address') as FormGroup;
  }

  next() {
    if (this.UserForm.valid) {
      console.log("Formulario válido, avanzando al siguiente paso...");
      this.state.setAccount(this.UserForm.value);
      console.log("State actualizado: ", this.state);
      console.log("State account: ", this.state.getAccount());
      this.router.navigate(['/signIn/shelter/details']);
    }
  }
}