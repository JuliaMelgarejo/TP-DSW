import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimalService } from '../../../../services/animal/animal.service';
import { Animal } from '../../../../models/animal/animal.model';
import { AdoptModalComponent } from '../../../adopt-animal/adopt-modal/adopt-modal.component';
import { ToastNotificationService } from '../../../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-animal-public',
  standalone: true,
  imports: [CommonModule, RouterLink, AdoptModalComponent],
  templateUrl: './animal-public.component.html',
  styleUrl: './animal-public.component.css',
})
export class AnimalPublicComponent {
  selectedAnimal: any;
  @ViewChild(AdoptModalComponent) adoptModal!: AdoptModalComponent;
  readonly BACKEND_BASE = 'http://localhost:3000';

  // ✅ chips/panel
  activeInfo: 'description' | 'breed' | 'rescue' = 'breed';

  constructor(private route: ActivatedRoute, public animalService: AnimalService, private toast: ToastNotificationService) {}

  
  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.getAnimal(id);
  }

  openAdoptModal() {
    this.adoptModal?.open();
  }

  getAnimal(id: number) {
    this.animalService.getAnimal(id).subscribe({
      next: (res) => {
        this.selectedAnimal = res.data;
      },
      error: (e) => this.toast.show(e.error.msg, 'danger'),
    });
  }

  // ======================
  // Fotos
  // ======================

  getMainPhotoUrl(): string {
    const url = this.selectedAnimal?.photos?.length ? this.selectedAnimal.photos[0].url : null;
    if (!url) return 'assets/nophoto.png';
    return url.startsWith('http') ? url : this.BACKEND_BASE + url;
  }

  getPhotoUrls(): string[] {
    const photos = this.selectedAnimal?.photos ?? [];
    if (!photos.length) return ['assets/nophoto.png'];

    return photos.map((p: any) => {
      const url = p.url;
      return url.startsWith('http') ? url : this.BACKEND_BASE + url;
    });
  }

  // id único para el carrusel
  carouselId(): string {
    const id = this.selectedAnimal?.id ?? 'x';
    return `animalCarousel-${id}`;
  }

  // ======================
  // Info (Raza / Rescate)
  // ======================

  showInfo(section: 'description' | 'breed' | 'rescue') {
    this.activeInfo = section;
  }

  getBreedName(): string {
    return this.selectedAnimal?.breed?.name ?? '—';
  }

  getBreedDescription(): string {
    return this.selectedAnimal?.breed?.description ?? 'Sin descripción de raza';
  }

  getRescueDateLabel(): string {
    const d = this.selectedAnimal?.rescueClass?.rescue_date;
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date.getTime()) ? String(d) : date.toLocaleDateString('es-AR');
  }

  getRescueAddressLabel(): string {
    const r = this.selectedAnimal?.rescueClass;
    if (!r) return '—';

    const street = r.street ?? '';
    const num = r.number_street ?? '';
    const city = r.city?.name ?? '';
    const shelter = r.shelters?.name ?? '';

    const addr = [street, num].filter(Boolean).join(' ');
    const extra = [city, shelter].filter(Boolean).join(' • ');

    if (addr && extra) return `${addr} — ${extra}`;
    return addr || extra || '—';
  }

  getRescueDescription(): string {
    return this.selectedAnimal?.rescueClass?.description ?? '';
  }

  getRescueComments(): string {
    return this.selectedAnimal?.rescueClass?.comments ?? '';
  }
}