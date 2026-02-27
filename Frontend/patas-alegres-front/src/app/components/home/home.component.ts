import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from  '../../services/auth/auth.service';
type Banner = {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: any[]; // routerLink array
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(public auth: AuthService) {}
  ngOnInit() {
  console.log('decoded token:', this.auth.getDecodedToken());
  console.log('role:', this.auth.getRole());
  console.log('isShelter:', this.auth.isShelter());
}
  // Cambiá las imágenes por las tuyas (assets/)
  banners: Banner[] = [
    {
      src: 'assets/banner1.png',
      alt: 'Adoptá, cambiá una vida',
      title: 'Adoptá hoy',
      subtitle: 'Dale una segunda oportunidad a un amigo.',
      ctaText: 'Ver animales',
      ctaLink: ['/animal'],
    },
    {
      src: 'assets/banner2.png',
      alt: 'Conmpra los mejores alimentos y ayudá refugios',
      title: 'Ayudá a los refugios',
      subtitle: 'Comprá nuestros productos.',
      ctaText: 'Ver productos',
      ctaLink: ['/buy'], // ajustá si tu ruta es otra
    },
    {
      src: 'assets/banner3.png',
      alt: 'Campañas de vacunación',
      title: 'Campañas y eventos',
      subtitle: 'Contactanos ',
      ctaText: 'Ver refugios',
      ctaLink: ['/shelter'], // ajustá si tu ruta es otra
    },
  ];
}