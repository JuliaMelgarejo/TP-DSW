import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/user/user.model.js';
import { UserService } from '../../services/user/user.service.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../../services/errors/error.service.js';
import { AuthService } from '../../services/auth/auth.service.js';


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
    private authService: AuthService
  ){

  }

  login(){
    // Validamos que el usuario ingrese datos
    if (this.username == '' || this.password == '') {
     alert('Todos los campos son obligatorios');
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
        this.router.navigate(['/home'])
      },
     error: (e: HttpErrorResponse) => {
          this.errorservice.msjError(e);
      }
    })
  }

}
