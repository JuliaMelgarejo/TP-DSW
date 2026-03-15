import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AnimalService } from '../../../services/animal/animal.service.js';
import { ActivatedRoute } from '@angular/router';
import { ToastNotificationService } from '../../../services/toast-notification/toast-notification.service.js';

@Component({
  selector: 'app-animal-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './animal-form.component.html',
  styleUrl: './animal-form.component.css'
})
export class AnimalFormComponent {
  animalForm: FormGroup;
  name: FormControl;
  birth_date: FormControl;
  breed: FormControl;
  rescueClass: FormControl;

  constructor(private route: ActivatedRoute,public animalService: AnimalService, private toast: ToastNotificationService) {
    this.name = new FormControl('', Validators.required);
    this.birth_date = new FormControl('');
    this.breed = new FormControl('');
    this.rescueClass = new FormControl('');
    
    this.animalForm = new FormGroup({
      name: this.name,
      birth_date: this.birth_date,
      breed: this.breed,
      rescueClass: this.rescueClass
    });
   }

  handleSubmit() {
    this.animalService.addAnimal(this.animalForm.value);
    this.animalForm.reset();
    this.toast.show('Animal añadido', 'success')
  }


  postAnimal(){
    this.animalService.postAnimal(this.animalForm.value).subscribe({
      next: (data) => {
        this.toast.show(data.message, 'success')
      },
      error: (e) => {
        this.toast.show(e.error.msg, 'danger')
      }
    });
  }
}
