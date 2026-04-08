import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PersonService } from '../../../services/person/person.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-person-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './person-profile.component.html',
  styleUrl: './person-profile.component.css'
})
export class PersonProfileComponent {
  selectedPerson: any;

  constructor(
    private personService: PersonService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.auth.getUserIdToken();

    if (id){
      this.personService.getPerson(id).subscribe(res => {
        this.selectedPerson = res.data;
      });
    }
  }
}