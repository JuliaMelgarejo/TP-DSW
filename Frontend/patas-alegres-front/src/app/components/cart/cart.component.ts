import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../services/product/product.service.js';
import { CartService } from '../../services/Cart/cart-service.service.js';
import { OrderService } from '../../services/order/order-srvice.service.js';
import { AppConfig } from '../../core/config/app.config.js';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service.js';

type CartRow = {
  product: any;
  qty: number;
};

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  rows: CartRow[] = [];
  loading = true;

  constructor(
    private cart: CartService,
    private productService: ProductService,
    private router: Router,
    private orderService: OrderService,
    private toast: ToastNotificationService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;

    const items = this.cart.getItems(); // [{productId, qty}]
    if (!items || items.length === 0) {
      this.rows = [];
      this.loading = false;
      return;
    }

    // Traemos cada producto por id (simple y funciona)
    const calls = items.map(i => this.productService.getProduct(i.productId));
    forkJoin(calls).subscribe({
      next: (responses) => {
        const products = responses.map(r => r.data);
        this.rows = products.map((p, idx) => ({
          product: p,
          qty: items[idx].qty,
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // helpers UI
  photoUrl(p: any): string {
    const url = p?.photos?.length ? p.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : AppConfig.apiBase + url;
  }

  price(p: any): number {
    return Number(p?.prices?.[0]?.amount || 0);
  }

  discountPercent(p: any): number {
    const crossed = Number(p?.crossed_out_price || 0);
    const pr = this.price(p);
    if (!crossed || crossed <= pr || pr <= 0) return 0;
    return Math.round((1 - pr / crossed) * 100);
  }

  lineSubtotal(row: CartRow): number {
    return this.price(row.product) * row.qty;
  }

  subtotal(): number {
    return this.rows.reduce((acc, r) => acc + this.lineSubtotal(r), 0);
  }

  dec(row: CartRow) {
    if (row.qty <= 1) return;
    row.qty -= 1;
    this.cart.setQty(row.product.id, row.qty);
  }

  inc(row: CartRow) {
    row.qty += 1;
    this.cart.setQty(row.product.id, row.qty);
  }

  setQty(productId: number, qty: number) {
    // si tu CartService no tiene setQty, lo resolvemos reescribiendo items:
    const items = this.cart.getItems().map(i =>
      i.productId === productId ? ({ ...i, qty }) : i
    );
    // hack simple: usamos clear() y re-add
    this.cart.clear();
    for (const it of items) this.cart.add(it.productId, it.qty);
  }

  remove(row: CartRow) {
    this.cart.remove(row.product.id);
    this.rows = this.rows.filter(r => r.product.id !== row.product.id);
  }

  cancel() {
    this.cart.clear();
    this.rows = [];
    this.router.navigate(['/product']);
  }

  checkout() {
    const items = this.cart.getItems();

    if (!items || items.length === 0) {
      this.toast.show('Tu carrito está vacío', 'info')
      return;
    }

    this.orderService.checkout(items).subscribe({
      next: (res) => {
        // vaciar carrito
        this.cart.clear();
        this.rows = [];

        // si el backend devuelve la order creada:
        const orderId = res?.data?.id;

        this.toast.show('Compra realizada', 'success')

        // redirigí donde quieras:
        // si tenés detalle de orden:
        // this.router.navigate(['/orders', orderId]);

        // si no, volvemos a productos:
        this.router.navigate(['/product']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al finalizar la compra';
        this.toast.show(msg, 'danger')
      }
    });
  }

  // formato moneda
  money(n: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
  }
}