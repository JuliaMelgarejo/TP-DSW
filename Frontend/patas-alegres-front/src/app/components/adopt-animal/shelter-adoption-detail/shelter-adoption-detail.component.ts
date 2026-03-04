import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdoptionService } from '../../../services/adoption/adoption.service';

@Component({
  selector: 'app-shelter-adoption-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shelter-adoption-detail.component.html',
  styleUrl: './shelter-adoption-detail.component.css',
})
export class ShelterAdoptionDetailComponent {
  item: any = null;

  loading = true;
  errMsg = '';
  okMsg = '';

  // estados dinámicos
  states: any[] = [];
  statesLoading = true;
  statesErr = '';

  // cambio de estado
  stateType = '';
  reason = '';
  saving = false;

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(
    private route: ActivatedRoute,
    private adoptionService: AdoptionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.loadDetail(id);
    this.loadStates();
  }

  // ================================
  // CARGAR DETALLE
  // ================================
  loadDetail(id: number) {
    this.loading = true;
    this.errMsg = '';
    this.okMsg = '';

    this.adoptionService.getShelterAdoptionDetail(id).subscribe({
      next: (res) => {
        this.item = (res as any).data ?? null;
        this.loading = false;

        // si ya hay estado actual, sugerimos por defecto el actual (para detectar cambio)
        const current = this.getCurrentState();
        if (!this.stateType) this.stateType = current;
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudo cargar el detalle';
      },
    });
  }

  // ================================
  // CARGAR ESTADOS DISPONIBLES
  // ================================
  loadStates() {
    this.statesLoading = true;
    this.statesErr = '';

    this.adoptionService.getAdoptionStates().subscribe({
      next: (res) => {
        this.states = (res as any).data ?? [];

        // ordenar por type
        this.states.sort((a: any, b: any) =>
          String(a.type).localeCompare(String(b.type))
        );

        // si todavía no hay selección, ponemos el primer estado
        if (!this.stateType && this.states.length) {
          this.stateType = this.states[0].type;
        }

        this.statesLoading = false;
      },
      error: (err) => {
        this.statesLoading = false;
        this.statesErr = err?.error?.message ?? 'No se pudieron cargar los estados';
      },
    });
  }

  // ================================
  // FOTO ANIMAL
  // ================================
  getMainPhoto(): string {
    const p = this.item?.animal?.photos?.length
      ? this.item.animal.photos[0]?.url
      : null;

    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }

  // ================================
  // HISTORIAL
  // ================================
  getStatuses(): any[] {
    // soporta Collection serializada como { items: [...] }
    const s =
      this.item?.statuses?.items ??
      this.item?.statuses ??
      this.item?.adoptions?.items ??
      this.item?.adoptions ??
      [];

    const arr = Array.isArray(s) ? s : [];

    // orden: más nuevo primero
    return [...arr].sort(
      (a: any, b: any) =>
        new Date(b.statusChangeDate).getTime() -
        new Date(a.statusChangeDate).getTime()
    );
  }

  getCurrentState(): string {
    const statuses = this.getStatuses();
    if (!statuses.length) return 'PENDIENTE';
    return statuses[0]?.adoptionState?.type ?? 'PENDIENTE';
  }

  // ================================
  // UI helpers (badges)
  // ================================
  stateBadgeClass(type?: string): string {
    const t = String(type ?? '').toUpperCase();

    // Colores “semánticos”
    if (t === 'APROBADO' || t === 'ACEPTADO') return 'pa-badge-success';
    if (t === 'RECHAZADO') return 'pa-badge-danger';
    if (t === 'PENDIENTE') return 'pa-badge-warning';
    if (t === 'CANCELADO') return 'pa-badge-neutral';

    // default (marca)
    return 'pa-badge-primary';
  }

  canSave(): boolean {
    if (this.saving) return false;
    if (!this.item?.id) return false;
    if (!this.stateType) return false;

    const current = this.getCurrentState();
    return String(this.stateType).toUpperCase() !== String(current).toUpperCase();
  }

  // ================================
  // GUARDAR NUEVO ESTADO
  // ================================
  saveStatus() {
    if (!this.item?.id) return;

    if (!this.canSave()) {
      this.errMsg = 'No hay cambios para guardar.';
      return;
    }

    const current = this.getCurrentState();
    const next = this.stateType;

    const ok = window.confirm(
      `¿Confirmás cambiar el estado?\n\nActual: ${current}\nNuevo: ${next}`
    );
    if (!ok) return;

    this.saving = true;
    this.errMsg = '';
    this.okMsg = '';

    this.adoptionService
      .addShelterStatus(this.item.id, this.stateType, this.reason || undefined)
      .subscribe({
        next: () => {
          this.saving = false;
          this.okMsg = 'Estado actualizado correctamente ✅';
          this.reason = '';

          // recargar detalle para refrescar historial
          this.loadDetail(this.item.id);
        },
        error: (err) => {
          this.saving = false;
          this.errMsg = err?.error?.message ?? 'No se pudo actualizar el estado';
        },
      });
  }

  isCancelled(): boolean {
  const state = (this.item?.currentState ?? '').toUpperCase();
  return !!this.item?.deleted_at || !!this.item?.isDeleted || state === 'CANCELADO' || state === 'CANCELADA';
}
}