import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Person } from '../../../models/person/person.model.js';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonService } from '../../../services/person/person.service.js';
import { AuthService } from '../../../services/auth/auth.service.js';
import { ErrorService } from '../../../services/errors/error.service.js';
import { Province } from '../../../models/province/province.module.js';
import { Country } from '../../../models/country/country.module.js';
import { CountryService } from '../../../services/country/country.service.js';
import { ProvinceService } from '../../../services/province/province.service.js';
import { CityService } from '../../../services/city/city.service.js';
import { City } from '../../../models/city/city.module.js';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.css'
})
export class PersonDetailComponent {
  selectedPerson: Person | any;
  PersonForm: FormGroup;
  documentTypes: { value: string, label: string }[] = [];
  cities: City[] = [];
  provinces: Province[] = [];
  countries: Country[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    public errorService: ErrorService,
    public personService: PersonService,
    public auth: AuthService,
    public cityService: CityService,
    public provinceService: ProvinceService,
    public countryService: CountryService
  ) {
    this.PersonForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      doc_type: ['', Validators.required],
      doc_nro: ['', Validators.required],
      email: ['', Validators.email],
      phoneNumber: [''],
      birthdate: ['', Validators.required],
      street: ['', Validators.required],
      number_street: [0, Validators.required],
      nroCuit: [''],
      country: [{ value: null, disabled: true }, Validators.required],
      province: [{ value: null, disabled: true }, Validators.required],
      city: [{ value: null, disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromRoute ? Number(idFromRoute) : this.auth.getUserIdToken();
    this.loadCountries();
    if (id) {
      this.getPerson(id);
    }

    this.personService.getDocumentTypes().subscribe( types => {
      this.documentTypes = types;
    });
  }

  getPerson(id: number){
    this.personService.getPerson(id).subscribe({
      next: (response) => {
        this.selectedPerson = response.data;
        this.PersonForm.patchValue({
          name: this.selectedPerson.name,
          surname: this.selectedPerson.surname,
          doc_type: this.selectedPerson.doc_type,
          doc_nro: this.selectedPerson.doc_nro,
          email: this.selectedPerson.email,
          phoneNumber: this.selectedPerson.phoneNumber,
          birthdate: this.selectedPerson.birthdate,
          nroCuit: this.selectedPerson.nroCuit,
          street: this.selectedPerson.street,
          number_street: this.selectedPerson.number_street,
          country: [{ value: null, disabled: true }, Validators.required],
          province: [{ value: null, disabled: true }, Validators.required],
          city: [{ value: null, disabled: true }, Validators.required],
        });
        this.loadLocationHierarchy(this.selectedPerson.city);
      },
      error: (error) => {
        alert('Ups, ocurrio un error: ' + error.message);
      }
    });
  }

  updatePerson(){
    const updatedPerson = {
      ...this.PersonForm.value,
      id: this.selectedPerson.id,
    }
    this.personService.updatePerson(updatedPerson).subscribe({
      next: (res) => {
        alert('Persona actualizada con éxito');
        this.router.navigate(['/profile', res.data.id]);
      },
      error: (error) => {
        alert('Ups, ocurrio un error: ' + error.message);
        this.router.navigate(['/profile', this.selectedPerson.id]);
      }
    })
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
    const countryId = this.PersonForm.get('country')?.value;

    this.PersonForm.get('province')?.reset();
    this.PersonForm.get('city')?.reset();

    this.PersonForm.get('province')?.enable();
    this.PersonForm.get('city')?.disable();

    this.cities = [];

    this.provinceService.getByCountry(countryId).subscribe({
      next: (data) => {
        this.provinces = data.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  onProvinceChange() {
    const provinceId = this.PersonForm.get('province')?.value;

    this.PersonForm.get('city')?.reset();
    this.PersonForm.get('city')?.enable();

    this.cityService.getByProvince(provinceId).subscribe({
      next: (res) => {
        this.cities = res.data;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  loadLocationHierarchy(cityId: number) {
    this.cityService.getCity(cityId).subscribe({
      next: (res) => {
        const city = res.data;

        this.provinceService.getProvince(city.province).subscribe({
          next: (res) => {
            const province = res.data;

            // Habilitamos controles en orden
            this.PersonForm.get('country')?.enable();
            this.PersonForm.get('province')?.enable();
            this.PersonForm.get('city')?.enable();

            // Seteamos valores
            this.PersonForm.patchValue({
              country: province.country,
              province: province.id,
              city: city.id
            });

            // Cargamos listas
            this.provinceService.getByCountry(province.country).subscribe({
              next: (data) => {
                this.provinces = data.data;
              }
            });

            this.cityService.getByProvince(province.id).subscribe({
              next: (data) => {
                this.cities = data.data;
              }
            });
          }
        });
      },
      error: (error) => {
        console.log('Error al obtener la ciudad:', error);
      }
    });
  }
}
