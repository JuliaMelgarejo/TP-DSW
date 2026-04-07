import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuOpen = false;

 constructor(private router: Router,
  public auth: AuthService,
 ) { }

  closeMenu() {
    const navbar = document.getElementById('navbarContent');
    if (navbar?.classList.contains('show')) {
      navbar.classList.remove('show');
    }
  }

  logOut() {
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }
}