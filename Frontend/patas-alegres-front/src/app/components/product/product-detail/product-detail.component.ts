import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product/product.service.js';
import { environment } from '../../../../environments/environment.js';
import { CartService } from '../../../services/Cart/cart-service.service.js';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  product: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService
  ) {}

  ngOnInit() {
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

  addToCart() {
    this.cart.add(this.product.id, 1);
  }

  buyNow() {
    this.cart.clear();
    this.cart.add(this.product.id, 1);
  }
}