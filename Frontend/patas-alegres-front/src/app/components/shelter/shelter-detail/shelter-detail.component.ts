import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShelterService } from '../../../services/shelter/shelter.service.js';
import { Shelter } from '../../../models/shelter/shelter.model.js';
import { AuthService } from '../../../services/auth/auth.service.js';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-shelter-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AddressPickerComponent],
  templateUrl: './shelter-detail.component.html',
  styleUrl: './shelter-detail.component.css'
})
export class ShelterDetailComponent {
  shelterForm: FormGroup;
  selectedShelter!: Shelter;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public shelterService: ShelterService,
    public auth: AuthService,
  ) {

    this.shelterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      tuitionVet: ['', Validators.required],
      max_capacity: ['', Validators.required],
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
    const idFromRoute = Number(this.route.snapshot.paramMap.get('id'));
    const id = idFromRoute ? Number(idFromRoute) : this.auth.getShelterIdToken();
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
          max_capacity: this.selectedShelter.max_capacity,
          address: {
            latitude: this.selectedShelter.address.latitude,
            longitude: this.selectedShelter.address.longitude,
            province: this.selectedShelter.address.province,
            city: this.selectedShelter.address.city,
            formattedAddress: this.selectedShelter.address.formattedAddress,
            placeId: this.selectedShelter.address.placeId,
            street: this.selectedShelter.address.street,
            streetNumber: this.selectedShelter.address.streetNumber,
            postalCode: this.selectedShelter.address.postalCode,
            country: this.selectedShelter.address.country
          }
        });
      }
    });
  }

  get addressForm(): FormGroup {
    return this.shelterForm.get('address') as FormGroup;
  }

  updateShelter() {
    const updated = {
      ...this.shelterForm.value,
      id: this.selectedShelter.id,
    };

    this.shelterService.updateShelter(updated).subscribe({
      next: () => console.log('Refugio actualizado')
    });
  }
}