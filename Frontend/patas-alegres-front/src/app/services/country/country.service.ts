import { Injectable } from '@angular/core';
import { Country } from '../../models/country/country.module';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../core/config/app.config.js';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  readonly API_URL= `${AppConfig.apiUrl}/country`;
  countries: Country[] = [];

  constructor(private http: HttpClient) {
    this.countries = [];

   }

   addCountry(animal: Country) {
    this.countries.push(animal);
  }

    getCountries(){
      return this.http.get<{message: string, data: Country[]}>(this.API_URL) 
    }

    getCountry(id: number) {
      return this.http.get<Country>(this.API_URL + '/' + id)
    }

    postCountry(animal: Country) {
      return this.http.post<{message: string, data: Country}>(this.API_URL, animal)
    }

    updateCountry(animal: Country){
    return this.http.put<{message: string, data: Country}>(`${this.API_URL}/${animal.id}`, animal);
    }

    deleteCountry(id:number){
      return this.http.delete<{message: string, data: Country}>(`${this.API_URL}/${id}`);
    }
}
