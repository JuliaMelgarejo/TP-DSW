import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SignInStateService } from '../../../services/sign-in-state/sign-in-state.service.js';
import { UserService } from '../../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";

@Component({
  selector: 'app-sign-in-shelter-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AddressPickerComponent, RouterLink],
  templateUrl: './sign-in-shelter-details.component.html'
})
export class SignInShelterDetailsComponent implements OnInit {
  ShelterForm: FormGroup;
  backendErrors: Record<string, string> = {};
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private state: SignInStateService,
    private userService: UserService,
    private router: Router,
  ) {
    this.ShelterForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      tuitionVet: ['', Validators.required],
      max_capacity: [null, [Validators.required, Validators.min(1)]],
      address: new FormGroup({
        latitude: new FormControl('', [Validators.required]),
        longitude: new FormControl('', [Validators.required]),
        province: new FormControl('', [Validators.required]),
        city: new FormControl('', [Validators.required]),
        formattedAddress: new FormControl('', [Validators.required]),
        placeId: new FormControl(''),
        street: new FormControl(''),
        streetNumber: new FormControl(''),
        postalCode: new FormControl(''),
        country: new FormControl('', [Validators.required])
      })
    });
  }

  ngOnInit(): void {
    const account = this.state.getAccount();
    if (!account) {
      this.router.navigate(['/signIn/shelter/account']);
      return;
    }

    const savedShelter = this.state.getShelter();
    if (savedShelter) {
      this.ShelterForm.patchValue(savedShelter);
    }
  }

  get addressForm(): FormGroup {
    return this.ShelterForm.get('address') as FormGroup;
  }

  goBack() {
    this.state.setShelter(this.ShelterForm.value);
    this.router.navigate(['/signIn/shelter/account']);

  }

  finish() {
    this.backendErrors = {};
    this.submitError = '';

    if (this.ShelterForm.invalid) {
      this.ShelterForm.markAllAsTouched();
      return;
    }

    const account = this.state.getAccount();
    if (!account) {
      this.submitError = 'Faltan los datos del paso 1';
      this.router.navigate(['/signIn/shelter/account']);
      return;
    }

    this.state.setShelter(this.ShelterForm.value);

    const payload = {
      ...account,
      role: 'SHELTER',
      shelter: this.ShelterForm.value
    };

    this.userService.signIn(payload).subscribe({
      next: () => {
        alert('Usuario y refugio creados exitosamente');
        this.state.clear();
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitError = err.error?.msg || 'No se pudo completar el registro';
        this.backendErrors = err.error?.errors || {};
      }
    });
  }
}