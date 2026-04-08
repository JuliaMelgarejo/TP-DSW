import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PersonService } from '../../services/person/person.service';
import { ToastNotificationService } from '../../services/toast-notification/toast-notification.service';

@Component({
  selector: 'app-person',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './person.component.html',
  styleUrl: './person.component.css'
})
export class PersonComponent {
  constructor( private router: Router, public personService: PersonService, private toast: ToastNotificationService) {}

  ngOnInit(): void{
    this.getPeople();
  }

  getPeople(){
    this.personService.getPeople().subscribe({
    next: (response) =>{
      this.personService.people = response.data;
    },
    error: (e) => {
      this.toast.show(e.error.msg, 'danger')
    }
    })
  }

  deletePerson(id: number){
    this.personService.deletePerson(id).subscribe({
    next: (response) =>{
      this.getPeople();
    },
    error: (e) => {
      this.toast.show(e.error.msg, 'danger')
    }
    })
  }

  navigateToPersonCreate(){
    this.router.navigate(['/person/create']);
  }
}

