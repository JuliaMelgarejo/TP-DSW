import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order/order-srvice.service';
import { AppConfig } from '../../../core/config/app.config';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-order-shelter-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-shelter-detail.component.html',
  styleUrl: './order-shelter-detail.component.css'
})
export class OrderShelterDetailComponent {
  loading = true;
  order: any = null;
  saving = false;

  states: { id: number; type: string; description?: string }[] = [];
  loadingStates = true;

  BACKEND_BASE = AppConfig.apiBase;
  role = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toast: ToastNotificationService
  ) {}

  ngOnInit() {
    this.loadRole();
    this.load();
    this.loadStates();
  }

  loadRole() {
    const token = localStorage.getItem('token');

    if (!token) {
      this.role = '';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.role = String(payload?.role || '').toUpperCase();
    } catch {
      this.role = '';
    }
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.orderService.getMyOrderDetail(id).subscribe({
      next: (res) => {
        this.order = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        let msg = err?.error?.message || 'No se pudo cargar el pedido';
        this.toast.show(msg, 'danger')
      }
    });
  }

  loadStates() {
    this.loadingStates = true;

    this.orderService.getOrderStates().subscribe({
      next: (res) => {
        const data = res?.data;

        if (!Array.isArray(data)) {
          this.states = [];
          this.loadingStates = false;
          return;
        }

        this.states = data
          .map((s: any) => ({
            id: Number(s.id),
            type: String(s.type || '').toUpperCase(),
            description: s.description ?? ''
          }))
          .filter((s: any) => !!s.type);

        this.loadingStates = false;
      },
      error: () => {
        this.states = [];
        this.loadingStates = false;
      }
    });
  }

  isShelter(): boolean {
    return this.role === 'SHELTER';
  }

  isUser(): boolean {
    return this.role === 'USER';
  }

  getAvailableStates(): { id: number; type: string; description?: string }[] {
    const current = String(this.order?.currentState || '').toUpperCase();

    const allowedTransitions: Record<string, string[]> = {
      PENDIENTE: ['ACEPTADO', 'RECHAZADO'],
      ACEPTADO: ['ENVIADO'],
      ENVIADO: ['ENTREGADO'],
      ENTREGADO: [],
      RECHAZADO: [],
      CANCELADO: [],
    };

    const allowed = allowedTransitions[current] ?? [];

    return this.states.filter(s => allowed.includes(String(s.type || '').toUpperCase()));
  }

  getItemPhotoUrl(item: any): string {
    const url = item?.product?.photo;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  changeState(newState: string) {
    if (!this.isShelter()) return;
    if (!this.order?.id) return;
    if (!newState) return;

    this.saving = true;

    this.orderService.addStatus(this.order.id, {
      type: newState,
      motive: `Actualizado a ${newState}`
    }).subscribe({
      next: () => {
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.saving = false;
        let msg = err?.error?.message || 'Error cambiando estado';
        this.toast.show(msg, 'danger')
      }
    });
  }

  getStatusBadgeClass(type: string): string {
    const t = String(type || '').toUpperCase();

    if (t === 'PENDIENTE') return 'text-bg-secondary';
    if (t === 'ACEPTADO') return 'text-bg-primary';
    if (t === 'ENVIADO') return 'text-bg-warning';
    if (t === 'ENTREGADO') return 'text-bg-success';
    if (t === 'CANCELADO') return 'text-bg-danger';
    if (t === 'RECHAZADO') return 'text-bg-danger';

    return 'text-bg-dark';
  }
}