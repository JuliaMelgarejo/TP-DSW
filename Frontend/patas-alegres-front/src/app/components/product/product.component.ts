import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service.js';
import { ProductService } from '../../services/product/product.service.js';
import { Product } from '../../models/product/product.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/Cart/cart-service.service.js';
import { ProductFilters } from '../../models/product/product-filters.js';
import { Shelter } from '../../models/shelter/shelter.model.js';
import { Category } from '../../models/category/category.js';
import { CategoryService } from '../../services/Category/category.service.js';
import { ShelterService } from '../../services/shelter/shelter.service.js';
import { AppConfig } from '../../core/config/app.config.js';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  products: Product[] = [];
  totalProducts: number = 0;
  totalPages: number = 1;
  filters: ProductFilters = {
    page: 1,
    limit: 12
  };
  shelters: Shelter[] = [];
  categories: Category[] = [];
  isShelter: boolean;

  constructor(
    public auth: AuthService,
    public productService: ProductService,
    private cart: CartService,
    private route: ActivatedRoute,
    public router: Router,
    private categoryService: CategoryService,
    private shelterService: ShelterService,
  ) 
  {
    this.isShelter = this.auth.isShelter();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        page: Number(params['page']) || 1,
        limit: Number(params['limit']) || 12,
        shelterId: params['shelterId'] ? Number(params['shelterId']) : undefined,
        categoryId: params['categoryId'] ? Number(params['categoryId']) : undefined,
        minPrice: params['minPrice'] ? Number(params['minPrice']) : undefined,
        maxPrice: params['maxPrice'] ? Number(params['maxPrice']) : undefined,
        sort: params['sort'] ?? undefined,
      };
      this.loadProducts();
    });
    this.loadFilters();
  }

  getProductPhotoUrl(product: Product): string {
    const url = product?.photos?.length
      ? product.photos[0].url
      : null;

    if (!url) return 'assets/nophoto.png';

    return url.startsWith('http') ? url : AppConfig.apiBase + url;
  }

  loadProducts() {
    const query: ProductFilters = { ...this.filters };
    if (this.isShelter) {
      query.shelterId = this.auth.getShelterIdToken();
    }
    this.productService.getProducts(query).subscribe(res => {
      this.products = res.data;
      this.totalProducts = res.total;
      this.totalPages = res.totalPages;
    });
    if (this.filters.page! > this.totalPages && this.totalPages > 0) {
      this.goToPage(this.totalPages);
    }
  }

  loadFilters(){ // paginar
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res.data;
    });
    if (!this.auth.isShelter()){
      this.shelterService.getShelters().subscribe(res => {
        this.shelters = res.data;
      });
    }
  }

  goToPage(page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  applyFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filters,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  get page(): number {
    return this.filters.page ?? 1;
  }

  removeFilter(type: string) {
    if (type === 'shelter') {
      this.filters.shelterId = undefined;
    }
    if (type === 'category') {
      this.filters.categoryId = undefined;
    }
    if (type === 'sort') {
      this.filters.sort = undefined;
    }

    this.applyFilters()
  }

  getShelterName(id?: number) {
    return this.shelters.find(s => s.id === id)?.name;
  }

  getCategoryName(id?: number) {
    return this.categories.find(c => c.id === id)?.name;
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: 1,
        limit: 12,
        shelterId: null,
        categoryId: null,
        sort: null,
        minPrice: null,
        maxPrice: null
      }
    });
    this.loadProducts();
  }

  get pages(): number[] {
    const max = 5
    const start = Math.max(this.page - 2, 1)
    const end = Math.min(start + max - 1, this.totalPages)

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  getDiscount(product: Product) {
    if (!product.crossed_out_price) return 0

    return Math.round(
      (1 - product.prices[0].amount / product.crossed_out_price) * 100
    )
  }
}
