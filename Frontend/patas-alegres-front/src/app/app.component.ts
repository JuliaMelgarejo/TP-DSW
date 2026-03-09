import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./components/shared/header/header/header.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showHeader = true;

  constructor(private router: Router) {
  this.router.events.subscribe(() => {
    // Rutas donde no quieres mostrar el header
    const hiddenHeaderRoutes = ['/login', '/signIn/user', '/signIn/shelter/account', '/signIn/shelter/details'];
    this.showHeader = !hiddenHeaderRoutes.includes(this.router.url);
  });
}
}
