import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order/order-srvice.service';

@Component({
  selector: 'app-order-shelter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-shelter.component.html',
})
export class OrderShelterComponent {
  loading = true;
  orders: any[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.orderService.getShelterOrders().subscribe({
      next: (res) => {
        this.orders = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'No se pudieron cargar los pedidos');
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
    return 'text-bg-dark';
  }

  // opcional: resumen de items para mostrar "x productos"
  getItemsCount(o: any): number {
    const items = o?.items ?? [];
    return Array.isArray(items) ? items.length : 0;
  }
}