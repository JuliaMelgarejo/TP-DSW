import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-rescue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddressPickerComponent],
  templateUrl: './rescue-form.component.html',
  styleUrl: './rescue-form.component.css',
})
export class RescueFormComponent {
  @Output() submitRescue = new EventEmitter<any>();

  // Form SOLO datos rescate
  rescueForm = new FormGroup({
    rescue_date: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl(''),
    comments: new FormControl(''),
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

  get addressForm(): FormGroup {
    return this.rescueForm.get('address') as FormGroup;
  }

  onSubmit(): void {
    if (this.rescueForm.invalid) {
      this.rescueForm.markAllAsTouched();
      return;
    }

    const v: any = this.rescueForm.value;

    const formPayload = {
      rescue_date: v.rescue_date,
      description: v.description ?? '',
      comments: v.comments ?? '',
      address: {
        latitude: v.address.latitude,
        longitude: v.address.longitude,
        province: v.address.province,
        city: v.address.city,
        formattedAddress: v.address.formattedAddress,
        placeId: v.address.placeId,
        street: v.address.street,
        streetNumber: v.address.streetNumber,
        postalCode: v.address.postalCode,
        country: v.address.country
      }
    };
    this.submitRescue.emit(formPayload);
  }
}