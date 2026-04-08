import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnimalService } from '../../services/animal/animal.service';
import { Animal } from '../../models/animal/animal.model';
import { Person } from '../../models/person/person.model';
import { PersonService } from '../../services/person/person.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdoptionService } from '../../services/adoption/adoption.service';
import { Adoption } from '../../models/adoption/adoption.model';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-adopt-animal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adopt-animal.component.html',
  styleUrl: './adopt-animal.component.css'
})
export class AdoptAnimalComponent {
  selectedAnimal: Animal | any;
  people: Person[] | any;
  docType: string = '';
  docNro: string = '';
  foundPerson: Person | null = null;
  comments: string = '';

  constructor(private route: ActivatedRoute, public animalService: AnimalService, public personService: PersonService, private adoptionService: AdoptionService, private toast: ToastNotificationService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.getAnimal(id);
    this.getPeople();
  }

  getAnimal(id: number) {
    this.animalService.getAnimal(id).subscribe({
      next: (res) => {
        this.selectedAnimal = res.data;
      },
      error: (e) => this.toast.show(e.error.msg, 'warning')
    });
  }

  getPeople(){
    this.personService.getPeople().subscribe({
      next:(response) => {
        this.people = response.data;
      },
      error:(e) => {
        this.toast.show(e.error.msg, 'warning')
      }
    })
  }

  searchPerson(){
    this.personService.searchPerson(this.docType, this.docNro).subscribe({
      next:(response) => {
        this.foundPerson = response.data;
      },
      error:(e) => {
        this.toast.show(e.error.msg, 'warning')
        this.foundPerson = null;
      }
    })
  }

  confirmAdoption() {
    if (this.selectedAnimal && this.foundPerson) {
      const newAdoption = new Adoption(
        this.selectedAnimal.id,
        this.foundPerson.id!,
        new Date(),
        this.comments
      );

      this.adoptionService.postAdoption(newAdoption).subscribe({
        next: (res) => {
          this.toast.show(res.message, 'success')
        },
        error: (e) => {
          this.toast.show(e.error.msg, 'warning')
        },
      });
    }
  }
}
