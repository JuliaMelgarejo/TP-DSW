import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdoptionService } from '../../../services/adoption/adoption.service';

@Component({
  selector: 'app-adopt-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './adopt-list.component.html',
  styleUrl: './adopt-list.component.css',
})
export class AdoptListComponent {
  items: any[] = [];
  loading = true;
  errMsg = '';

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(private adoptionService: AdoptionService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.errMsg = '';

    this.adoptionService.getShelterAdoptions().subscribe({
      next: (res) => {
        this.items = (res as any).data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudieron cargar las solicitudes';
      },
    });
  }

  goDetail(id: number) {
    // ruta de detalle para shelter (podés definirla como quieras)
    this.router.navigate(['/shelter-adoptions', id]);
  }

  getPhoto(item: any): string {
    const p = item?.animal?.photos?.length ? item.animal.photos[0]?.url : null;
    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }
}