import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = environment.url;

  constructor(private http: HttpClient) {}
  
  getShelterOrders() {
    return this.http.get<any>(`${this.baseUrl}/api/order/shelter`);
  }

  addStatus(orderId: number, payload: { type: string; motive?: string }) {
    return this.http.post<any>(`${this.baseUrl}/api/order/${orderId}/status`, payload);
  }

  checkout(items: { productId: number; qty: number }[]) {
    return this.http.post<any>(`${this.baseUrl}/api/order/checkout`, { items });
  }

  getShelterOrderDetail(id: number) {
    return this.http.get<any>(`${this.baseUrl}/api/order/shelter/${id}`);
  }

    
  getAll() {
    return this.http.get<any>(`${this.baseUrl}/api/orderState`);
  }
}