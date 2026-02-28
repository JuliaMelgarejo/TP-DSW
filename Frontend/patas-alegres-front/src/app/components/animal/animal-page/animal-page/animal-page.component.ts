import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalDetailsComponent } from '../../animal-details/animal-details.component';
import { AnimalPublicComponent } from '../../animal-public/animal-public/animal-public.component';
import { AuthService } from '../../../../services/auth/auth.service';


@Component({
  selector: 'app-animal-page',
  standalone: true,
  imports: [CommonModule, AnimalDetailsComponent, AnimalPublicComponent],
  template: `
    <app-animal-details *ngIf="auth.isShelter(); else userView"></app-animal-details>
    <ng-template #userView>
      <app-animal-public></app-animal-public>
    </ng-template>
  `
})
export class AnimalPageComponent {
  constructor(public auth: AuthService) {}

  ngOnInit() {
  console.log('decoded token:', this.auth.getDecodedToken());
  console.log('role:', this.auth.getRole());
  console.log('isShelter:', this.auth.isShelter());
}
}

//esto es para que despues manejemos los roles cuando tengamos bien el registro 