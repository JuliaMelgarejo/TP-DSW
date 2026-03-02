import { Component, Input } from '@angular/core';
import { AdoptionService } from '../../../services/adoption/adoption.service';
import * as bootstrap from 'bootstrap'; 
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-adopt-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './adopt-modal.component.html',
  styleUrl: './adopt-modal.component.css'
})
export class AdoptModalComponent {
  @Input() animalId!: number;
  modalId = 'adoptionRequestModal';
  comments = '';
  loading = false;
  okMsg = '';
  errMsg = '';
  private modalInstance: bootstrap.Modal | null = null;
  constructor(private adoptionService: AdoptionService) {}


  open() {
    this.okMsg = '';
    this.errMsg = '';
    this.comments = '';

    const el = document.getElementById(this.modalId);
    if (!el) return;

    el.addEventListener('hidden.bs.modal', () => {
      this.okMsg = '';
      this.errMsg = '';
      this.comments = '';
      this.loading = false;
    }, { once: true });

    const modal = new bootstrap.Modal(el);
    modal.show();
  }
  submit() {
    this.loading = true;
    this.okMsg = '';
    this.errMsg = '';

    this.adoptionService.createForAnimal(this.animalId, this.comments || undefined).subscribe({
      next: () => {
        this.loading = false;
        this.okMsg = 'Solicitud enviada.';

        setTimeout(() => {
        this.modalInstance?.hide();
      }, 900);
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.msg ?? err?.error?.message ?? 'No se pudo enviar la solicitud';
      },
    });
  }

}
