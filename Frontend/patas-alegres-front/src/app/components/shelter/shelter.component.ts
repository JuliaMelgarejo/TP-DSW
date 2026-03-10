import { Component } from '@angular/core';
import { ShelterService } from '../../services/shelter/shelter.service.js';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-shelter',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shelter.component.html',
  styleUrl: './shelter.component.css'
})
export class ShelterComponent {
  loading = true;
  shelters: any[] = [];

  constructor(
    private router: Router,
    public shelterService: ShelterService
  ) {}

  ngOnInit(): void {
    this.getShelters();
  }

  getShelters() {
    this.loading = true;

    this.shelterService.getShelters().subscribe({
      next: (response) => {
        this.shelters = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      }
    });
  }

  goToShelterDetail(id: number) {
    this.router.navigate(['/shelters', id]);
  }

  getAddressText(shelter: any): string {
    const a = shelter?.address;
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

  getAnimalsCount(shelter: any): number {
    if (Array.isArray(shelter?.rescues)) return shelter.rescues.length;
    return 0;
  }
}