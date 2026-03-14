import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private baseUrl = environment.url;

  constructor(private http: HttpClient) {}

  getCountries(type: string){
    return this.http.get<string[]>(`${this.baseUrl}/api/location/countries?type=${type}`)
  }

  getProvinces(type: string, country: string){
    return this.http.get<string[]>(`${this.baseUrl}/api/location/provinces?country=${country}&type=${type}`)
  }

  getCities(type: string, country: string, province: string){
    return this.http.get<string[]>(`${this.baseUrl}/api/location/cities?country=${country}&province=${province}&type=${type}`)
  }
}