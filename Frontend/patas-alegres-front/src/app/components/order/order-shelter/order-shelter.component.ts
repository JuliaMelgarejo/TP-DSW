import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order/order-srvice.service';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-order-shelter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-shelter.component.html',
})
export class OrderShelterComponent {
  loading = true;
  orders: any[] = [];
  role = '';

  constructor(private orderService: OrderService, private toast: ToastNotificationService) {}

  ngOnInit() {
    this.loadRole();
    this.load();
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
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        let msg = err?.error?.message || 'No se pudieron cargar los pedidos';
        this.toast.show(msg, 'danger')
      },
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

  getItemsCount(o: any): number {
    return Number(o?.itemsCount || 0);
  }

  isShelter(): boolean {
    return this.role === 'SHELTER';
  }

  isUser(): boolean {
    return this.role === 'USER';
  }
}