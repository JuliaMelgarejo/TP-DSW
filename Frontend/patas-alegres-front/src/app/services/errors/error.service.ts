import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastNotificationService } from '../toast-notification/toast-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private toast: ToastNotificationService) { }

    msjError(e: HttpErrorResponse) {
    if (e.error.msg) {
      this.toast.show(e.error.msg, 'danger')
    } else {
      this.toast.show('Upps ocurrio un error, comuniquese con el administrador.', 'danger')
    }
  }
}
