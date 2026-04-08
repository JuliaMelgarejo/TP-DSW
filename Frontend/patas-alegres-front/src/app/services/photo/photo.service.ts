import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfig } from '../../core/config/app.config';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private API = 'http://localhost:3000/api/photo';

  constructor(private http: HttpClient) {}

  // SUBIR foto de un animal
  uploadAnimalPhoto(animalId: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file); // nombre del field

    return this.http.post<{ message: string; data: any }>(
      `${this.API}/animal/${animalId}`,
      formData
    );
  }

  uploadPhoto(type: 'animal' | 'product', id: number, file: File) {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post(
      `${AppConfig.apiUrl}/photo/${type}/${id}`,
      formData
    );
  }

  // ELIMINAR foto por id (borra registro; el back debería borrar el archivo también)
  deletePhoto(photoId: number) {
    return this.http.delete<{ message: string }>(`${this.API}/${photoId}`);
  }

  // (opcional) si querés tenerlo
  getPhoto(photoId: number) {
    return this.http.get<{ data: any }>(`${this.API}/${photoId}`);
  }

  // (opcional) si tu backend lo soporta
  getPhotos() {
    return this.http.get<{ data: any[] }>(`${this.API}`);
  }
}