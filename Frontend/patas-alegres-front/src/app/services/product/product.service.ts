import { Injectable } from '@angular/core';
import { Product } from '../../models/product/product.js';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductFilters } from '../../models/product/product-filters.js';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly API_URL= `${AppConfig.apiUrl}/product`;
  products: Product[] = [];

  constructor(private http: HttpClient) { 
    this.products = [];
  }

  getProducts(filters?: ProductFilters) {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{
      message: string,
      total: number,
      page: number,
      totalPages: number,
      limit: number,
      data: Product[]
    }>(this.API_URL, { params })
  }

  getProduct(id: number) {
    return this.http.get<{message: string, data: Product}>(this.API_URL + '/' + id)
  }

  postProduct(product: Product) {
    return this.http.post<{message: string, data: Product}>(this.API_URL, product)
  }

  updateProduct(product: Product){
    return this.http.put<{message: string, data: Product}>(`${this.API_URL}/${product.id}`, product);
  }

  deleteProduct(id:number){
    return this.http.delete<{message: string, data: Product}>(`${this.API_URL}/${id}`);
  }
}
