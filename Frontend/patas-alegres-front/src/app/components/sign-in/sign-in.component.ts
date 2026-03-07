import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../services/errors/error.service.js';
import { PersonService } from '../../services/person/person.service.js';
import { AddressPickerComponent } from "../shared/address-picker/address-picker.component";


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddressPickerComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css'
})
export class SignInComponent {
  [x: string]: any;
  UserForm: FormGroup;
  documentTypes: { value: string, label: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public userService: UserService,
    public errorService: ErrorService,
    public personService: PersonService,
    public router: Router,
  ) 
   {
    this.UserForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      person: new FormGroup({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
        doc_type: new FormControl(null, [Validators.required]),
        doc_nro: new FormControl('', [Validators.required]),
        email: new FormControl(''),
        phoneNumber: new FormControl(''),
        birthdate: new FormControl(''),
        nroCuit: new FormControl(''),
        address: new FormGroup({
          latitude: new FormControl('', [Validators.required]),
          longitude: new FormControl('', [Validators.required]),
          province: new FormControl(''),
          city: new FormControl(''),
          formattedAddress: new FormControl(''),
          placeId: new FormControl(''),
          street: new FormControl(''),
          streetNumber: new FormControl(''),
          postalCode: new FormControl(''),
          country: new FormControl('')
        })
      })
    });
  }

  ngOnInit(): void {
    this.personService.getDocumentTypes().subscribe( types => {
      this.documentTypes = types;
    });
  }

  SignIn() {
    if (this.UserForm.valid) {
      const payload = {
        username: this.UserForm.value.username,
        password: this.UserForm.value.password,
        role: 'USER',
        person: this.UserForm.value.person
      };

      console.log(payload);
     
      this.userService.signIn(payload).subscribe({
        next: () => {
              alert('Usuario y Persona creados exitosamente!');
              this.router.navigate(['/login']);
            },});
    } else {
      alert('Por favor, complete todos los campos requeridos correctamente.');
      console.log('Formulario inválido');
      console.log(this.UserForm.value);
      console.log(this.UserForm.errors);

    }
  }
  
  get addressForm(): FormGroup {
    return this.UserForm.get('person.address') as FormGroup;
  }
}