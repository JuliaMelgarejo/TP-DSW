import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user/user.model.js';
import { Observable } from 'rxjs';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly API_URL = `${AppConfig.apiUrl}/user`;
  readonly API_URL2 = `${AppConfig.apiUrl}/user/login`;
  users: User[] = [];

  constructor(private http: HttpClient) { 
    this.users = [];

  }

    signIn(user: User){
    return this.http.post<{message: string, data: User}>(this.API_URL , user);  }

    addUser(user: User) {
    this.users.push(user);}

   login(user: User):Observable<string> {
    return this.http.post<string>(this.API_URL2, user)
   }

   checkUsername(username: string) {
    const encoded = encodeURIComponent(username)
    return this.http.get<{ exists: boolean; msg?: string }>(`${this.API_URL}/check-username/${encoded}`);
   }
}
