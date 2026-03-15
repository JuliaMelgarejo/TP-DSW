import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormBuilder, AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, of } from 'rxjs';
import {debounceTime, distinctUntilChanged,switchMap,takeUntil, catchError,finalize} from 'rxjs/operators';
import { UserService } from '../../../services/user/user.service.js';
import { ErrorService } from '../../../services/errors/error.service.js';
import { PersonService } from '../../../services/person/person.service.js';
import { SignInStateService } from '../../../services/sign-in-state/sign-in-state.service.js';
import { AddressPickerComponent } from "../../shared/address-picker/address-picker.component";
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';


@Component({
  selector: 'app-sign-in-shelter-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,AddressPickerComponent, RouterLink],
  templateUrl: './sign-in-shelter-account.component.html'
})
export class SignInShelterAccountComponent implements OnInit, OnDestroy {
  UserForm: FormGroup;
  documentTypes: { value: string, label: string }[] = [];
  submitError = '';
  usernameExistsError = '';
  checkingUsername = false;

  private destroy$ = new Subject<void>();
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  constructor(
    private fb: FormBuilder,
    private state: SignInStateService,
    public userService: UserService,
    public errorService: ErrorService,
    public personService: PersonService,
    public router: Router,
    private toast: ToastNotificationService
  ) {
    this.UserForm = this.fb.group({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(this.passwordPattern)
      ]),
      person: this.fb.group({
        name: new FormControl('', [Validators.required]),
        surname: new FormControl('', [Validators.required]),
        doc_type: new FormControl(null, [Validators.required]),
        doc_nro: new FormControl('', [Validators.required, Validators.pattern(/^\d+$/)]),
        email: new FormControl('', [Validators.email]),
        phoneNumber: new FormControl('', [Validators.pattern(/^\d{6,15}$/)]),
        birthdate: new FormControl('', [Validators.required, this.pastDateValidator()]),
        nroCuit: new FormControl('', [Validators.pattern(/^\d{11}$/)]),
        address: this.fb.group({
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
      })
    });
  }

  ngOnInit(): void {
    this.personService.getDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types;
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });

    const saved = this.state.getAccount();
    if (saved) {
      this.UserForm.patchValue(saved);
    }

    const usernameControl = this.UserForm.get('username');

    usernameControl?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        switchMap((value) => {
          const username = String(value || '').trim();

          this.usernameExistsError = '';
          this.clearUsernameExistsError();

          if (!username || username.length < 3) {
            this.checkingUsername = false;
            return of(null);
          }

          if (usernameControl.hasError('required') || usernameControl.hasError('minlength')) {
            this.checkingUsername = false;
            return of(null);
          }

          this.checkingUsername = true;

          return this.userService.checkUsername(username).pipe(
            catchError((e) => {
              this.toast.show(e.error.msg, 'danger')
              return of(null);
            }),
            finalize(() => {
              this.checkingUsername = false;
            })
          );
        })
      )
      .subscribe((res: any) => {
        if (!res) return;

        const control = this.UserForm.get('username');
        if (!control) return;

        if (res.exists) {
          this.usernameExistsError = 'Ese nombre de usuario ya existe. Elegí otro.';
          control.setErrors({
            ...(control.errors || {}),
            usernameExists: true
          });
        } else {
          this.clearUsernameExistsError();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  pastDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const inputDate = new Date(control.value);
      const today = new Date();

      inputDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (inputDate > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  private clearUsernameExistsError(): void {
    this.usernameExistsError = '';

    const usernameControl = this.UserForm.get('username');
    if (!usernameControl?.hasError('usernameExists')) return;

    const errors = { ...(usernameControl.errors || {}) };
    delete errors['usernameExists'];
    usernameControl.setErrors(Object.keys(errors).length ? errors : null);
  }

  get addressForm(): FormGroup {
    return this.UserForm.get('person.address') as FormGroup;
  }

  goBack() {
  this.state.clear();
  this.router.navigate(['/login']);
  }

  next() {
    this.submitError = '';

    if (this.checkingUsername) {
      this.submitError = 'Esperá a que termine la validación del nombre de usuario';
      return;
    }

    if (this.usernameExistsError) {
      this.UserForm.get('username')?.markAsTouched();
      this.submitError = 'Corregí los campos marcados antes de continuar';
      return;
    }

    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched();
      this.submitError = 'Corregí los campos marcados antes de continuar';
      return;
    }

    this.state.setAccount(this.UserForm.value);
    this.router.navigate(['/signIn/shelter/details']);
  }
}