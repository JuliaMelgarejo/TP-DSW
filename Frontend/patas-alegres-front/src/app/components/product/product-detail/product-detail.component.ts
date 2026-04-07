import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProductService } from '../../../services/product/product.service';
import { CartService } from '../../../services/Cart/cart-service.service';
import { OrderService } from '../../../services/order/order-srvice.service';
import { FormsModule } from '@angular/forms';
import { AppConfig } from '../../../core/config/app.config';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  product: any = null;
  loading = true;

  isAddingToCart = false;
  showAddedModal = false;
  addedQty = 1;
  cartCount = 0;


  showBuyNowModal = false;
  isPlacingOrder = false;
  buyNowQty = 1;

  showOrderCreatedModal = false;
  createdOrderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private orderService: OrderService,
    private router: Router,
    private toast: ToastNotificationService
  ) {}

  ngOnInit() {
    this.refreshCartCount();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }


  private refreshCartCount() {
    const items = this.cart.getItems?.() ?? [];
    this.cartCount = Array.isArray(items)
      ? items.reduce((acc: number, it: any) => acc + Number(it.qty || 0), 0)
      : 0;
  }

  closeAddedModal() {
    this.showAddedModal = false;
  }


  getPhotoUrl(): string {
    const url = this.product?.photos?.length ? this.product.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : AppConfig.apiBase + url;
  }

  getPrice(): number {
    return Number(this.product?.prices?.[0]?.amount || 0);
  }

  getDiscountPercent(): number {
    const crossed = Number(this.product?.crossed_out_price || 0);
    const price = this.getPrice();
    if (!crossed || crossed <= price || price <= 0) return 0;
    return Math.round((1 - price / crossed) * 100);
  }

  getBuyNowTotal(): number {
    return this.getPrice() * Number(this.buyNowQty || 1);
  }


  addToCart(qty: number = 1) {
    if (!this.product?.id) return;
    if (this.isAddingToCart) return;

    this.isAddingToCart = true;
    this.addedQty = qty;

    setTimeout(() => {
      this.cart.add(this.product.id, qty);

      this.refreshCartCount();
      this.isAddingToCart = false;
      this.showAddedModal = true;
    }, 350);
  }

  openBuyNowModal(qty: number = 1) {
    if (!this.product?.id) return;
    this.buyNowQty = qty;
    this.showBuyNowModal = true;
  }

  closeBuyNowModal() {
    if (this.isPlacingOrder) return;
    this.showBuyNowModal = false;
  }

  confirmBuyNow() {
    if (!this.product?.id) return;

    const qty = Number(this.buyNowQty || 1);
    if (qty <= 0) return;

    if (Number(this.product?.stock ?? 0) < qty) {
      this.toast.show('Stock insuficiente para la cantidad seleccionada', 'info')
      return;
    }

    this.isPlacingOrder = true;

    this.orderService.checkout([{ productId: this.product.id, qty }]).subscribe({
      next: (res) => {
        this.isPlacingOrder = false;
        this.showBuyNowModal = false;

        this.createdOrderId = res?.data?.id ?? null;
        this.showOrderCreatedModal = true;
      },
      error: (err) => {
        this.isPlacingOrder = false;
        const msg = err?.error?.message || 'No se pudo crear el pedido';
        this.toast.show(msg, 'danger')
      }
    });
  }

  closeOrderCreatedModal() {
    this.showOrderCreatedModal = false;
  }

  goToCart() {
    this.showOrderCreatedModal = false;
    this.router.navigate(['/cart']);
  }

  goToOrderDetail() {
    if (!this.createdOrderId) return;
    this.showOrderCreatedModal = false;
    this.router.navigate(['/order', this.createdOrderId]); 
  }
}