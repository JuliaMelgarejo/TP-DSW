import { Injectable } from '@angular/core';
import { City } from '../../models/city/city.module';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  readonly API_URL = `${AppConfig.apiUrl}/city`;

  cities: City[] = [];

  constructor(private http: HttpClient) { 
    this.cities = [];
  
  }

  getByProvince(provinceId: number){
    return this.http.get<{message: string, data: City[]}>(`${this.API_URL}/by-province/${provinceId}`);
  }
  getPeople(){
    return this.http.get<{message: string, data: City[]}>(this.API_URL);
  }

  getCity(id: number){
    return this.http.get<{data: City}>(`${this.API_URL}/${id}`);
  }

  postCity(City: City){
    return this.http.post<{message: string, data: City}>(this.API_URL, City);
  }

  updateCity(City: City){
    return this.http.put<{message: string, data: City}>(`${this.API_URL}/${City.id}`, City);
  }

  deleteCity(id: number){
    return this.http.delete<{message: string, data: City}>(`${this.API_URL}/${id}`);
  }

}
