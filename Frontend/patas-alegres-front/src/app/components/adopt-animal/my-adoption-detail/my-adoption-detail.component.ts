import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdoptionService } from '../../../services/adoption/adoption.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-adoption-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-adoption-detail.component.html',
  styleUrl: './my-adoption-detail.component.css'
})
export class MyAdoptionDetailComponent {
  item: any = null;
  loading = true;
  errMsg = '';

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(private route: ActivatedRoute, private adoptionService: AdoptionService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.errMsg = '';

    this.adoptionService.getAdoptionDetail(id).subscribe({
      next: (res) => {
        this.item = (res as any).data ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudo cargar el detalle';
      },
    });
  }

  getMainPhoto(): string {
    const p = this.item?.animal?.photos?.length ? this.item.animal.photos[0]?.url : null;
    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }

  // estado actual: tomamos el último status por fecha
  getCurrentState(): string {
    const statuses = this.item?.adoptions?.items ?? this.item?.adoptions ?? this.item?.statuses ?? [];
    if (!Array.isArray(statuses) || statuses.length === 0) return 'PENDIENTE';

    const latest = [...statuses].sort((a: any, b: any) =>
      new Date(b.fechaCambioEstado).getTime() - new Date(a.fechaCambioEstado).getTime()
    )[0];

    return latest?.state?.tipoEstado ?? latest?.state?.name ?? 'PENDIENTE';
  }
}
