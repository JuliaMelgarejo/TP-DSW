import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private API = 'http://localhost:3000/api/photo';

  constructor(private http: HttpClient) {}

  uploadAnimalPhoto(animalId: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file); // 👈 debe llamarse "photo"

    return this.http.post<{ message: string; data: any }>(
      `${this.API}/animal/${animalId}`,
      formData
    );
  }
}
