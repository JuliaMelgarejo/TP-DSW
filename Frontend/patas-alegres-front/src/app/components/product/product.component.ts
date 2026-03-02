import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service.js';
import { ProductService } from '../../services/product/product.service.js';
import { Product } from '../../models/product/product.js';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  Math = Math;

  constructor(public auth: AuthService, public productService: ProductService) 
  {
  }

  ngOnInit() {
    if (this.auth.isShelter()) {
      this.productService.getProducts({ 
        shelterId: this.auth.getShelterIdToken(), 
        page: 1, 
        limit: 12
      }).subscribe( res => {
        this.products = res.data;
        this.totalProducts = res.total;
      });
    } else {
      this.productService.getProducts({ page: 1, limit: 12 }).subscribe( res => {
        this.products = res.data;
        this.totalProducts = res.total;
      });
    }
  }
}
