import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdoptionService } from '../../../services/adoption/adoption.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-adoption-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-adoption-detail.component.html',
  styleUrl: './my-adoption-detail.component.css',
})
export class MyAdoptionDetailComponent implements OnInit {
  item: any = null;
  loading = true;
  errMsg = '';

  // soft delete UI
  deleting = false;
  okMsg = '';
  deleteErrMsg = '';

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.errMsg = '';

    this.adoptionService.getMyAdoptions().subscribe({
      next: (res) => {
        const adoptions = (res as any).data ?? [];
        this.item = adoptions.find((a: any) => a.id === id) ?? null;
        this.loading = false;

        if (!this.item) {
          this.errMsg = 'Solicitud no encontrada';
          return;
        }

        if (this.item?.deleted_at) {
          this.router.navigate(['/my-adoptions']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudo cargar el detalle';
      },
    });
  }

  // ✅ Soft delete
  softDelete() {
    const id = Number(this.item?.id);
    if (!id) return;

    const ok = confirm('¿Seguro que querés eliminar esta solicitud? (se borrará de tus listas)');
    if (!ok) return;

    this.deleting = true;
    this.okMsg = '';
    this.deleteErrMsg = '';

    this.adoptionService.softDeleteAdoption(id).subscribe({
      next: (res) => {
        this.deleting = false;
        this.okMsg = (res as any)?.message ?? 'Solicitud eliminada';

        // volver a la lista después de borrar
        this.router.navigate(['/my-adoptions']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteErrMsg = err?.error?.message ?? 'No se pudo eliminar la solicitud';
      },
    });
  }

  getMainPhoto(): string {
    const p = this.item?.animal?.photos?.length ? this.item.animal.photos[0]?.url : null;
    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }

  // ✅ ¡Aquí está la simplificación!
  // El backend ahora nos manda directamente el "currentState" y el arreglo correcto de "statuses"
  getCurrentState(): string {
    return this.item?.currentState ?? 'PENDIENTE';
  }

  getBadgeClass(type: string): string {
    const map: any = {
      PENDIENTE: 'text-bg-warning',
      APROBADO: 'text-bg-success',
      CANCELADO: 'text-bg-danger',
      RECHAZADO: 'text-bg-danger'
    };

    return map[type?.toUpperCase()] || 'text-bg-info';
  }
}