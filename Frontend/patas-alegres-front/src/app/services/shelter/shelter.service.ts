import { Injectable } from '@angular/core';
import { Shelter } from '../../models/shelter/shelter.model.js';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ShelterFilters } from '../../models/shelter/shelter-filters.js';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class ShelterService {
  readonly API_URL = `${AppConfig.apiUrl}/shelter`;

  shelters: Shelter[] = [];

  constructor(private http: HttpClient) { 
    this.shelters = [];
  }

  getShelters(filters?: ShelterFilters){
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
      data: Shelter[]
    }>(this.API_URL, { params })
  }

  getShelter(id: number){
    return this.http.get<{data: Shelter}>(`${this.API_URL}/${id}`);
  }

  postShelter(Shelter: Shelter){
    return this.http.post<{message: string, data: Shelter}>(this.API_URL, Shelter);
  }

  updateShelter(Shelter: Shelter){
    return this.http.put<{message: string, data: Shelter}>(`${this.API_URL}/${Shelter.id}`, Shelter);
  }

  deleteShelter(id: number){
    return this.http.delete<{message: string, data: Shelter}>(`${this.API_URL}/${id}`);
  }

  findByBoundary(north: number, south: number, east: number, west: number, userLat: number, userLng: number){
    return this.http.get<{message: string, data: Shelter[], isUserInsideMap: boolean}>(`${this.API_URL}/findByBoundary?nort=${north}&south=${south}&east=${east}&west=${west}&userLat=${userLat}&userLng=${userLng}`);
  }
}
