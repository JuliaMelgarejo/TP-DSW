import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Person } from '../../../models/person/person.model.js';
import { ActivatedRoute } from '@angular/router';
import { PersonService } from '../../../services/person/person.service.js';
import { AuthService } from '../../../services/auth/auth.service.js';
import { ErrorService } from '../../../services/errors/error.service.js';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.css'
})
export class PersonDetailComponent {
  selectedPerson: Person | any;
  PersonForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public errorService: ErrorService,
    public personService: PersonService,
    public auth: AuthService,
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
      city: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromRoute ? Number(idFromRoute) : this.auth.getUserIdToken();
    if (id) {
      this.getPerson(id);
    }
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
          city: this.selectedPerson.city,
        });
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
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        alert('Ups, ocurrio un error: ' + error.message);
      }
    })
  }
}
