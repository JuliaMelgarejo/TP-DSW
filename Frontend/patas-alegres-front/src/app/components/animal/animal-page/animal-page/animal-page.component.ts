import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalDetailsComponent } from '../../animal-details/animal-details.component';
import { AnimalPublicComponent } from '../../animal-public/animal-public/animal-public.component';


function getRole(): string {
  return localStorage.getItem('role') || 'USER';
}

@Component({
  selector: 'app-animal-page',
  standalone: true,
  imports: [CommonModule, AnimalDetailsComponent, AnimalPublicComponent],
  template: `
    <app-animal-public *ngIf="role === 'USER'; else adminView"></app-animal-public>
    <ng-template #adminView>
      <app-animal-details></app-animal-details>
    </ng-template>
  `
})
export class AnimalPageComponent {
  role = getRole();
}

//esto es para que despues manejemos los roles cuando tengamos bien el registro 