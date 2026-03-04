import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order/order-srvice.service';
import { environment } from '../../../../environments/environment.js';

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

  states: string[] = [];
  loadingStates = true;
  BACKEND_BASE = environment.url;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.orderService.getShelterOrderDetail(id).subscribe({
      next: (res) => {
        this.order = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'No se pudo cargar el pedido');
      }
    });
  }

  getItemPhotoUrl(item: any): string {
    const url = item?.product?.photo;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  changeState(newState: string) {
    if (!this.order?.id) return;
    if (!newState) return;

    this.saving = true;

    this.orderService.addStatus(this.order.id, {
      type: newState,
      motive: `Actualizado a ${newState}`
    }).subscribe({
      next: () => {
        this.saving = false;
        // recargar para actualizar currentState + timeline
        this.load();
      },
      error: (err) => {
        this.saving = false;
        alert(err?.error?.message || 'Error cambiando estado');
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
    return 'text-bg-dark';
  }
}