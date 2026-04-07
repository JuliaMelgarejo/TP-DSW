import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user/user.model.js';
import { UserService } from '../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../services/errors/error.service.js';
import { AuthService } from '../../services/auth/auth.service.js';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service.js';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = ""
  password: string = ""

  constructor(
    private userservice :UserService,
    private router :Router,
    private errorservice: ErrorService,
    private authService: AuthService,
    private toast: ToastNotificationService,
  ){

  }

  login(){
    // Validamos que el usuario ingrese datos
    if (this.username == '' || this.password == '') {
      this.toast.show('Todos los campos son obligatorios', 'warning')
      return
    }

    // Creamos el body
    const user: User = {
      username: this.username,
      password: this.password
    }

    this.userservice.login(user).subscribe({
      next: (token) => {
        this.authService.setToken(token);
        this.toast.show('Inicio sesion correctamente', 'success')
        this.router.navigate(['/home'])
      },
     error: (e: HttpErrorResponse) => {
        // this.errorservice.msjError(e);
        this.toast.show(e.error.msg, 'warning')
      }
    })
  }

}
