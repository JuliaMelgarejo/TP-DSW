export interface ProductFilters {
  shelterId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}