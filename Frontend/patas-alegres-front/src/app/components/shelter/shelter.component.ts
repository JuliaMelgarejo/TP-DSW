import { Component } from '@angular/core';
import { ShelterService } from '../../services/shelter/shelter.service.js';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Shelter } from '../../models/shelter/shelter.model.js';
import { LocationService } from '../../services/location/location.service.js';
import { ShelterFilters } from '../../models/shelter/shelter-filters.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-shelter',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './shelter.component.html',
  styleUrl: './shelter.component.css'
})
export class ShelterComponent {
  loading = true;
  shelters: Shelter[] = [];
  totalShelters: number = 0;
  totalPages: number = 1;
  countries: string[] = [];
  provinces: string[] = [];
  cities: string[] = [];
  filters: ShelterFilters = {
    page: 1,
    limit: 12
  };
  filterType: string = 'shelter'

  constructor(
    private router: Router,
    public shelterService: ShelterService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private toast: ToastNotificationService,
  ) {}

  ngOnInit(): void {
    // this.getShelters();
    this.route.queryParams.subscribe(params => {
      this.filters = {
        page: Number(params['page']) || 1,
        limit: Number(params['limit']) || 12,
        sort: params['sort'] ?? undefined,
        country: params['country'] ?? undefined,
        province: params['province'] ?? undefined,
        city: params['city'] ?? undefined
      };
      this.loadShelters();
    });
    this.loadFilters();

  }

  loadShelters() {
    const query: ShelterFilters = { ...this.filters };
    this.loading = true;

    this.shelterService.getShelters(query).subscribe({
      next: (res) => {
        this.shelters = res.data || [];
        this.totalShelters = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
        if (this.filters.page! > this.totalPages && this.totalPages > 0) {
          this.goToPage(this.totalPages);
        }
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'error')
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

  loadFilters(){ // paginar
    this.locationService.getCountries(this.filterType).subscribe(res => {
      this.countries = res;
    });
    if (this.filters.country) {
      this.locationService.getProvinces(this.filterType, this.filters.country).subscribe(res => this.provinces = res)
    }

    if (this.filters.country && this.filters.province) {
      this.locationService.getCities(this.filterType, this.filters.country, this.filters.province).subscribe(res => this.cities = res)
    }
  }

  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  applyFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filters,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  get page(): number {
    return this.filters.page ?? 1;
  }

  removeFilter(type: string) {
    (this.filters as any)[type] = undefined
    if (type === 'country') {
      this.filters.province = undefined
      this.filters.city = undefined
    }

    if (type === 'province') {
      this.filters.city = undefined
    }
    this.applyFilters()
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        limit: 12,
        country: null,
        province: null,
        city: null,
        sort: null,
      }
    });
    this.loadShelters();
  }

  get pages(): number[] {
    const max = 5
    const start = Math.max(this.page - 2, 1)
    const end = Math.min(start + max - 1, this.totalPages)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  onCountryChange() {
    const country = this.filters.country;

    if (!country) return;

    this.filters.province = undefined
    this.filters.city = undefined
    this.provinces = [];
    this.cities = [];
    this.locationService.getProvinces(this.filterType, country).subscribe(res => {
        this.provinces = res
        this.cities = []
      })
    this.applyFilters()
  }

  onProvinceChange() {
    const province = this.filters.province;

    if (!province) return;

    this.filters.city = undefined
    this.locationService.getCities(this.filterType, this.filters.country!, province).subscribe(res => {
        this.cities = res
      })
    this.applyFilters()
  }

  onCityChange() {
    const city = this.filters.city;

    if (!city) return;

    this.filters.city = city
    this.applyFilters()
  }

  get activeFilters() {
    const filters = []
    if (this.filters.country) {
      filters.push({
        key: 'country',
        label: 'País',
        value: this.filters.country,
        color: 'primary'
      })
    }

    if (this.filters.province) {
      filters.push({
        key: 'province',
        label: 'Provincia',
        value: this.filters.province,
        color: 'primary'
      })
    }

    if (this.filters.city) {
      filters.push({
        key: 'city',
        label: 'Ciudad',
        value: this.filters.city,
        color: 'primary'
      })
    }

    return filters
  }
}