import { Component } from '@angular/core';
import { AdoptionService } from '../../../services/adoption/adoption.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-adoptions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-adoptions.component.html',
  styleUrl: './my-adoptions.component.css'
})
export class MyAdoptionsComponent {
  items: any[] = [];
  loading = true;
  errMsg = '';

  readonly BACKEND_BASE = 'http://localhost:3000';

  constructor(private adoptionService: AdoptionService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.errMsg = '';

    this.adoptionService.getMyAdoptions().subscribe({
      next: (res) => {
        this.items = (res as any).data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errMsg = err?.error?.message ?? 'No se pudieron cargar tus solicitudes';
      },
    });
  }

  goDetail(id: number) {
    this.router.navigate(['/my-adoptions', id]);
  }

  // foto principal del animal (igual que venías usando)
  getPhoto(item: any): string {
    const p = item?.animal?.photos?.length ? item.animal.photos[0]?.url : null;
    if (!p) return 'assets/nophoto.png';
    return p.startsWith('http') ? p : this.BACKEND_BASE + p;
  }

}
