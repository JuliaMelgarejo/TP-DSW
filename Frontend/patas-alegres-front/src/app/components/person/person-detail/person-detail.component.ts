import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Person } from '../../../models/person/person.model.js';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PersonService } from '../../../services/person/person.service.js';
import { AuthService } from '../../../services/auth/auth.service.js';
import { ErrorService } from '../../../services/errors/error.service.js';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, AddressPickerComponent],
  templateUrl: './person-detail.component.html',
  styleUrl: './person-detail.component.css'
})
export class PersonDetailComponent {
  selectedPerson: Person | any;
  PersonForm: FormGroup;
  documentTypes: { value: string, label: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    public errorService: ErrorService,
    public personService: PersonService,
    public auth: AuthService,
    private toast: ToastNotificationService
  ) {
    this.PersonForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      doc_type: ['', Validators.required],
      doc_nro: ['', Validators.required],
      email: ['', Validators.email],
      phoneNumber: [''],
      birthdate: ['', Validators.required],
      nroCuit: [''],
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
    });
  }

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    const id = idFromRoute ? Number(idFromRoute) : this.auth.getUserIdToken();
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
          address: {
            latitude: this.selectedPerson.address?.latitude,
            longitude: this.selectedPerson.address?.longitude,
            formattedAddress: this.selectedPerson.address?.formattedAddress,
            placeId: this.selectedPerson.address?.placeId,
            street: this.selectedPerson.address?.street,
            streetNumber: this.selectedPerson.address?.streetNumber,
            city: this.selectedPerson.address?.city,
            province: this.selectedPerson.address?.province,
            postalCode: this.selectedPerson.address?.postalCode,
            country: this.selectedPerson.address?.country
          }
        });
        this.addressForm.updateValueAndValidity({ emitEvent: true });
      },
      error: (e) => {
        this.toast.show(e.error.message, 'danger')
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
        this.toast.show(res.message, 'success')
        this.router.navigate(['/profile', res.data.id]);
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
        this.router.navigate(['/profile', this.selectedPerson.id]);
      }
    })
  }

  get addressForm(): FormGroup {
    return this.PersonForm.get('address') as FormGroup;
  }
}
