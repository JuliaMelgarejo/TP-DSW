import { Component } from '@angular/core';
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
export class MyAdoptionDetailComponent {
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
    this.okMsg = '';
    this.deleteErrMsg = '';

    this.adoptionService.getAdoptionDetail(id).subscribe({
      next: (res) => {
        this.item = (res as any).data ?? null;
        this.loading = false;

        // si el backend te devuelve deleted_at y ya está borrada, podés redirigir
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

  // estado actual: tomamos el último status por fecha
  getCurrentState(): string {
    // OJO: en tu entity se llama "adoptions" pero en el resto veníamos usando "statuses".
    // Entonces chequeamos ambas variantes.
    const statuses =
      this.item?.adoptions?.items ??
      this.item?.adoptions ??
      this.item?.statuses?.items ??
      this.item?.statuses ??
      [];

    if (!Array.isArray(statuses) || statuses.length === 0) return 'PENDIENTE';

    const latest = [...statuses].sort((a: any, b: any) => {
      const da = new Date(a?.statusChangeDate ?? a?.fechaCambioEstado ?? 0).getTime();
      const db = new Date(b?.statusChangeDate ?? b?.fechaCambioEstado ?? 0).getTime();
      return db - da;
    })[0];

    return (
      latest?.adoptionState?.type ??
      latest?.state?.tipoEstado ??
      latest?.state?.name ??
      'PENDIENTE'
    );
  }
}