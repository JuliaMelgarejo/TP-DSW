import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProductService } from '../../../services/product/product.service.js';
import { environment } from '../../../../environments/environment.js';
import { CartService } from '../../../services/Cart/cart-service.service.js';
import { OrderService } from '../../../services/order/order-srvice.service.js';
import { FormsModule } from '@angular/forms';

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
    private router: Router
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
    return url.startsWith('http') ? url : environment.url + url;
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
      alert('Stock insuficiente para la cantidad seleccionada');
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
        alert(msg);
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