import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  toasts: any[] = [];

  show(message: string, type: string = 'success') {
    const toast = { message, type };

    this.toasts.push(toast);

    setTimeout(() => {
      this.remove(toast);
    }, 4000);
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
