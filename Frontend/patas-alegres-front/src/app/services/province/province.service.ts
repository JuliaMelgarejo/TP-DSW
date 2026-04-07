import { Injectable } from '@angular/core';
import { Province } from '../../models/province/province.module';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {
  readonly API_URL = `${AppConfig.apiUrl}/province`;

  provinces: Province[] = [];

  constructor(private http: HttpClient) { 
    this.provinces = [];
  
  }

  getByCountry(countryId: number){
    return this.http.get<{message: string, data: Province[]}>(`${this.API_URL}/by-country/${countryId}`);
  }
  getPeople(){
    return this.http.get<{message: string, data: Province[]}>(this.API_URL);
  }

  getProvince(id: number){
    return this.http.get<{data: Province}>(`${this.API_URL}/${id}`);
  }

  postProvince(Province: Province){
    return this.http.post<{message: string, data: Province}>(this.API_URL, Province);
  }

  updateProvince(Province: Province){
    return this.http.put<{message: string, data: Province}>(`${this.API_URL}/${Province.id}`, Province);
  }

  deleteProvince(id: number){
    return this.http.delete<{message: string, data: Province}>(`${this.API_URL}/${id}`);
  }

}
