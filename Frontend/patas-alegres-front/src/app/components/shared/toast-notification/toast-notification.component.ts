import { Component } from '@angular/core';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.css'
})
export class ToastNotificationComponent {
  constructor(public toastService: ToastNotificationService) {}

  get toasts() {
    return this.toastService.toasts;
  }

  remove(toast: any) {
    this.toastService.remove(toast);
  }

}
