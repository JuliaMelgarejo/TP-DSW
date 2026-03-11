export interface AnimalFilters {
  shelterId?: number;
  breedId?: number;
  minRescueDate?: number;
  maxRescueDate?: number;
  sort?: 'name_asc' | 'name_desc' | 'rescue_date' | 'breed';
  page?: number;
  limit?: number;
}