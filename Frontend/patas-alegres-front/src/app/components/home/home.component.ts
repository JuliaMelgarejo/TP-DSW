import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from  '../../services/auth/auth.service';
import { GoogleMap, MapInfoWindow, MapAdvancedMarker } from '@angular/google-maps';
import { PersonService } from '../../services/person/person.service.js';
import { ShelterService } from '../../services/shelter/shelter.service.js';
import { Shelter } from '../../models/shelter/shelter.model.js';
import { environment } from '../../../environments/environments.local.js';
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
  imports: [CommonModule, RouterLink, GoogleMap, MapInfoWindow, MapAdvancedMarker],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  @ViewChild(GoogleMap) map!: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  zoom = 14;
  center: google.maps.LatLngLiteral = { lat: -34.603722, lng: -58.381592 }; // Coordenadas de Buenos Aires
  display: google.maps.LatLngLiteral | null = null;
  shelters: Shelter[] = [];
  selectedShelter?: Shelter;
  markerShelterPositions: google.maps.LatLngLiteral[] = [];
  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMapsMapId,
    disableDefaultUI: true,
    zoomControl: true,
  }
  isUserInsideMap?: boolean;
  private loadTimeout?: any;

  constructor(
    public auth: AuthService,
    public personService: PersonService,
    public shelterService: ShelterService,
  ) {}
  ngOnInit() {
    this.getLocation()
  }

  loadShelters() {
    const bounds = this.map.getBounds();

    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const viewport = {
      north: ne.lat(),
      east: ne.lng(),
      south: sw.lat(),
      west: sw.lng()
    };

    this.shelterService.findByBoundary(viewport.north, viewport.south, viewport.east, viewport.west, this.center.lat, this.center.lng).subscribe((res) => {
      this.isUserInsideMap = res.isUserInsideMap;
      this.shelters = res.data.map((shelter) => ({
        ...shelter,
        address: {
          ...shelter.address,
          latitude: Number(shelter.address.latitude),
          longitude: Number(shelter.address.longitude),
        }
        })
      );
      this.markerShelterPositions = res.data.filter((shelter) => shelter.address).map((shelter) => ({
          lat: Number(shelter.address.latitude),
          lng: Number(shelter.address.longitude),
        }));
    });
  }

  openInfoWindow(marker: MapAdvancedMarker, shelter: Shelter) {
    this.selectedShelter = shelter;
    this.infoWindow.open(marker);
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

  getLocation() {
    if (this.auth.isUser()) {
      if (!navigator.geolocation) {
        this.loadUserAddress();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setMapCenter(position.coords.latitude, position.coords.longitude);
        },
        () => {
          this.loadUserAddress();
        }
      );
    }
  }

  setMapCenter(lat: number, lng: number) {
    this.center = { lat, lng };
  }

  loadUserAddress() {
    const personId = this.auth.getUserIdToken();
    if (!personId) return;
    this.personService.getPerson(personId).subscribe(person => {
      const addr = person.data.address;
      if (!addr) return;
      this.setMapCenter(Number(addr.latitude), Number(addr.longitude));
    });
  }

  loadSheltersDebounced() {
    clearTimeout(this.loadTimeout);
    this.loadTimeout = setTimeout(() => {
      this.loadShelters();
    }, 400);
  }
}