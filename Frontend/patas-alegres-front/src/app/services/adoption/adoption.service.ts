import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Adoption } from '../../models/adoption/adoption.model.js';

@Injectable({
  providedIn: 'root'
})
export class AdoptionService {
  readonly API_URL = 'http://localhost:3000/api'

  adoptions: Adoption[] = [];

  constructor(private http: HttpClient) { 
    this.adoptions = [];
  }

  createForAnimal(animalId: number, comments?: string) {
  return this.http.post<{ message: string; data: Adoption }>(`${this.API_URL}/animal/${animalId}/adoptions`,{ comments });
  }

  getShelterAdoptionsByAnimal(animalId: number) {
  return this.http.get<{ message: string; data: any[] }>(
    `${this.API_URL}/adoption/shelter/animals/${animalId}`
  );
}

  getShelterAdoptions() {
  return this.http.get<{ message: string; data: any[] }>(`${this.API_URL}/adoption/shelter`);
}

  getShelterAdoptionDetail(id: number) {
    return this.http.get<{ message: string; data: any }>(`${this.API_URL}/adoption/shelter/${id}`);
  }

  addShelterStatus(adoptionId: number, stateType: string, reason?: string) {
    return this.http.post<{ message: string; data: any }>(
      `${this.API_URL}/adoption/${adoptionId}/status`,
      { stateType, reason }
    );
  }

  getAdoptionStates() {
  return this.http.get<{ message: string; data: any[] }>(`${this.API_URL}/adoptionState`);
}

  getAdoptions(){
    return this.http.get<{message: string, data: Adoption[]}>(`${this.API_URL}/adoption`);
  }

  getAdoption(id: number){
    return this.http.get<{data: Adoption}>(`${this.API_URL}/adoption/${id}`);
  }

  postAdoption(Adoption: Adoption){
    return this.http.post<{message: string, data: Adoption}>(`${this.API_URL}/adoption`, Adoption);
  }

  updateAdoption(Adoption: Adoption){
    return this.http.put<{message: string, data: Adoption}>( `${this.API_URL}/adoption/${Adoption.id}`, Adoption);
  }

  deleteAdoption(id: number){
    return this.http.delete<{message: string, data: Adoption}>(`${this.API_URL}/adoption/${id}`);
  }

  softDeleteAdoption(id: number) {
  return this.http.delete<{ message: string }>(`${this.API_URL}/adoption/${id}`);
  }
  
  getMyAdoptions() {
  return this.http.get<{ message: string; data: any[] }>(`${this.API_URL}/adoption/me`);
  }

  getAdoptionDetail(id: number) {
    return this.http.get<{ message: string; data: any }>(`${this.API_URL}/adoption/${id}`);
  }

  

}
