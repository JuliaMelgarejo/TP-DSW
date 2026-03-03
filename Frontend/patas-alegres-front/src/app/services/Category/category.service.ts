import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.js';
import { Category } from '../../models/category/category.js';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  readonly API_URL= `${environment.apiUrl}/category`;
  categories: Category[] = [];

  constructor(private http: HttpClient) {
    this.categories = [];
  }

  getCategories() {
    return this.http.get<{ message: string, data: Category[] }>(this.API_URL)
  }

  getCategory(id: number) {
    return this.http.get<Category>(this.API_URL + '/' + id)
  }
}
