import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = environment.url;

  constructor(private http: HttpClient) {}

  checkout(items: { productId: number; qty: number }[]) {
    return this.http.post<any>(`${this.baseUrl}/api/order/checkout`, { items });
  }
}