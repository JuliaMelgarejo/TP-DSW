import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { ShelterService } from '../../../../services/shelter/shelter.service';
import { AnimalService } from '../../../../services/animal/animal.service';


@Component({
  selector: 'app-shelter-public-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, GoogleMap, MapMarker],
  templateUrl: './shelter-public-detail.component.html',
  styleUrl: './shelter-public-detail.component.css'
})
export class ShelterPublicDetailComponent {
  loading = true;
  loadingAnimals = true;

  selectedShelter: any = null;
  animals: any[] = [];

  readonly BACKEND_BASE = 'http://localhost:3000';

  center: google.maps.LatLngLiteral = {
    lat: -32.9442,
    lng: -60.6505
  };

  zoom = 15;

  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };

  constructor(
    private route: ActivatedRoute,
    private shelterService: ShelterService,
    private animalService: AnimalService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.getShelter(id);
      this.getAnimalsByShelter(id);
    } else {
      this.loading = false;
      this.loadingAnimals = false;
    }
  }

  getShelter(id: number) {
    this.loading = true;

    this.shelterService.getShelter(id).subscribe({
      next: (res) => {
        this.selectedShelter = res.data;

        const lat = Number(this.selectedShelter?.address?.latitude);
        const lng = Number(this.selectedShelter?.address?.longitude);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          this.center = { lat, lng };
        }

        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  getAnimalsByShelter(id: number) {
    this.loadingAnimals = true;

    this.animalService.getAnimalsByShelter(id).subscribe({
      next: (res) => {
        this.animals = res.data || [];
        this.loadingAnimals = false;
      },
      error: (err) => {
        console.log(err);
        this.animals = [];
        this.loadingAnimals = false;
      }
    });
  }

  get markerPosition(): google.maps.LatLngLiteral {
    const lat = Number(this.selectedShelter?.address?.latitude);
    const lng = Number(this.selectedShelter?.address?.longitude);

    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }

    return this.center;
  }

  getAddressText(): string {
    const a = this.selectedShelter?.address;
    if (!a) return 'Sin dirección';

    if (a.formattedAddress) return a.formattedAddress;

    const parts = [
      a.street,
      a.streetNumber,
      a.city,
      a.province,
      a.country
    ].filter(Boolean);

    return parts.length ? parts.join(', ') : 'Sin dirección';
  }

  getAnimalsCount(): number {
    return this.animals.length;
  }

  getPhotoUrl(animal: any): string {
    const url = animal?.photos?.length ? animal.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }


  hasGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!(window as any).google?.maps;
}
}