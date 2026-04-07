import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/config/app.config';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = AppConfig.apiBase;

  constructor(private http: HttpClient) {}

  getMyOrders() {
    return this.http.get<any>(`${this.baseUrl}/api/order/mine`);
  }

  getMyOrderDetail(id: number) {
    return this.http.get<any>(`${this.baseUrl}/api/order/mine/${id}`);
  }

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

    
  getOrderStates() {
    return this.http.get<any>(`${this.baseUrl}/api/orderState`);
  }
}