import { Injectable } from '@angular/core';
import { Animal } from '../../models/animal/animal.model.js';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Breed } from '../../models/breed/breed.model.js';
import { Rescue } from '../../models/rescue/rescue.model.js';
import { AnimalFilters } from '../../models/animal/animal-filters.js';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  /*updateAnimal(updatedAnimal: any) {
    throw new Error('Method not implemented.');
  }*/
  readonly API_URL = `${AppConfig.apiUrl}/animal`;
  private apiUrl = `${AppConfig.apiUrl}`;
  animals: Animal[] = [];

  constructor(private http: HttpClient) {
    this.animals = [];

   }

   addAnimal(animal: Animal) {
    this.animals.push(animal);
  }

  getAnimals(filters?: AnimalFilters){
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<{
      message: string,
      total: number,
      page: number,
      totalPages: number,
      limit: number,
      data: Animal[]
    }>(this.API_URL, { params })
  }

  getAnimalsByShelter(shelterId: number) {
    return this.http.get<{ message: string; data: Animal[] }>(`${this.API_URL}/shelter/${shelterId}`);
  }

    getBreed(id: number) {
    return this.http.get<{ mesage: string, data: Breed }>(`${this.apiUrl}/breed/${id}`);
  }

  getRescue(id: number) {
    return this.http.get<{ mesage: string, data: Rescue }>(`${this.apiUrl}/rescue/${id}`);
  }
  
  getAnimal(id: number) {
    return this.http.get<{data: Animal}>(this.API_URL + '/' + id)
  }

    postAnimal(animal: Animal) {
      return this.http.post<{message: string, data: Animal}>(this.API_URL, animal)
    }

    updateAnimal(animal: Animal){
    return this.http.put<{message: string, data: Animal}>(`${this.API_URL}/${animal.id}`, animal);
    }

    deleteAnimal(id:number){
      return this.http.delete<{message: string, data: Animal}>(`${this.API_URL}/${id}`);
    }
  }