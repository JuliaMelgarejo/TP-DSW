import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule,FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../services/errors/error.service.js';
import { PersonService } from '../../services/person/person.service.js';
import { City } from '../../models/city/city.module.js';
import { Province } from '../../models/province/province.module.js';
import { Country } from '../../models/country/country.module.js';
import { CityService } from '../../services/city/city.service.js';
import { ProvinceService } from '../../services/province/province.service.js';
import { CountryService } from '../../services/country/country.service.js';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
[x: string]: any;
  UserForm: FormGroup;
  username: FormControl;
  password: FormControl;
  name: FormControl;
  surname: FormControl;
  doc_type: FormControl;
  doc_nro: FormControl;
  email: FormControl;
  phoneNumber: FormControl;
  birthdate: FormControl;
  number_street: FormControl;
  street: FormControl;
  cities: City[] = []; 
  city: FormControl;
  provinces: Province[] = [];
  selectedProvince!: number;
  countries: Country[] = [];
  selectedCountry!: number;
  nroCuit: FormControl;
  user: FormControl;



  constructor(private route: ActivatedRoute,public userService: UserService, public errorService: ErrorService,
     public personService: PersonService,public cityService: CityService,public provinceService: ProvinceService, public countryService: CountryService, public router: Router) {
    this.username = new FormControl('',[Validators.required, Validators.minLength(3)]);
    this.password = new FormControl('',[Validators.required, Validators.minLength(6)]);
    

    this.name = new FormControl('', [Validators.required]);
    this.surname = new FormControl('', [Validators.required]);
    this.doc_type = new FormControl('', [Validators.required]);
    this.doc_nro = new FormControl('', [Validators.required]);
    this.email = new FormControl('');
    this.phoneNumber = new FormControl('');
    this.birthdate = new FormControl('');
    this.number_street = new FormControl('');
    this.street = new FormControl('', [Validators.required]);
    this.city = new FormControl('', [Validators.required]);
    this.nroCuit = new FormControl('');
    this.user = new FormControl('');


    {
    this.UserForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      person: new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
        doc_type: new FormControl('', [Validators.required]),
        doc_nro: new FormControl('', [Validators.required]),
        email: new FormControl(''),
        phone: new FormControl(''),
        birthdate: new FormControl(''),
        number_street: new FormControl(''),
        street: new FormControl(''),
        city: new FormControl(''),
        nroCuit: new FormControl(''),
        user: new FormControl(''),

      }),

      address: new  FormGroup({
        country: new FormControl(''),
        province: new FormControl(''),
      })
    });
  }
     }

ngOnInit(): void {
    this.loadCountries();

    // Cuando cambia país
    this.UserForm.get('address.country')?.valueChanges.subscribe(countryId => {

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
    this.UserForm.get('address.province')?.valueChanges.subscribe(provinceId => {

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
          console.log("llegue onCountryChange");
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
    

    SignIn() {
    if (this.UserForm.valid) {
      const payload = {
        username: this.UserForm.value.username,
        password: this.UserForm.value.password,
        role: 'USER',
        person: {...this.UserForm.value.person}
      };
     
    //const person = {  ...this.UserForm.value.person  };
      this.userService.signIn(payload).subscribe({
        next: () => {
              alert('Usuario y Persona creados exitosamente!');
              this.router.navigate(['/login']);
            },});
    }else {
      console.log('Formulario inválido');
      console.log(this.UserForm.value);
      console.log(this.UserForm.errors);

    }
  }
}
