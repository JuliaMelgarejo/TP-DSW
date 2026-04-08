import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdoptionService } from '../../../services/adoption/adoption.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppConfig } from '../../../core/config/app.config.js';

@Component({
  selector: 'app-adopt-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './adopt-list.component.html',
  styleUrl: './adopt-list.component.css',
})
export class AdoptListComponent {
  items: any[] = [];
  allItems: any[] = [];
  loading = true;
  errMsg = '';

  // paginación (si ya la tenías)
  page = 1;
  pageSize = 8;
  totalPages = 1;
  pages: number[] = [];

  // 🔹 filtro opcional
  animalId: number | null = null;

  readonly BACKEND_BASE = `${AppConfig.apiBase}`;

  constructor(
    private adoptionService: AdoptionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.params['id'];
    this.animalId = param ? Number(param) : null;
    this.load();
  }

  load() {
    this.loading = true;
    this.errMsg = '';

    const obs = this.animalId
      ? this.adoptionService.getShelterAdoptionsByAnimal(this.animalId)
      : this.adoptionService.getShelterAdoptions();

    obs.subscribe({
      next: (res) => {
        this.allItems = (res as any).data ?? [];
        this.setupPagination();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudieron cargar las solicitudes';
      },
    });
  }

  setupPagination() {
    this.totalPages = Math.max(1, Math.ceil(this.allItems.length / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goPage(1);
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    const start = (this.page - 1) * this.pageSize;
    this.items = this.allItems.slice(start, start + this.pageSize);
  }

  goDetail(id: number) {
    this.router.navigate(['/shelter-adoptions', id]);
  }

  getPhoto(item: any): string {
    const p = item?.animal?.photos?.length ? item.animal.photos[0]?.url : null;
    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }
}