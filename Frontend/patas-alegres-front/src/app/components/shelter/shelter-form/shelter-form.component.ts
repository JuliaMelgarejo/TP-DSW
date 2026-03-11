import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShelterService } from '../../../services/shelter/shelter.service.js';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ZoneService } from '../../../services/zone/zone.service.js';
import { VetService } from '../../../services/vet/vet.service.js';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-shelter-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, AddressPickerComponent],
  templateUrl: './shelter-form.component.html',
  styleUrl: './shelter-form.component.css'
})
export class ShelterFormComponent {
  ShelterForm: FormGroup;

  constructor(private route: ActivatedRoute, public shelterService: ShelterService, private zoneService: ZoneService, private vetService: VetService
    , private fb: FormBuilder,
  ){
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

  ngOnInit() {
  }

  get addressForm(): FormGroup {
    return this.ShelterForm.get('address') as FormGroup;
  }

  postShelter(){
    this.shelterService.postShelter(this.ShelterForm.value).subscribe({
      next: (data) => {
        console.log(data);
        alert('Refugio creado con éxito');
      },
      error: (error) => {
        console.log(error);
        alert('Error al crear el refugio: ' + (error.error?.message || 'Error desconocido'));
      }
    })
  }
}



