import { Breed } from '../breed/breed.model';
import { Photo } from '../photo/photo.module';
import { Rescue } from '../rescue/rescue.model.js';

export class Animal {
  id?: number;
  name!: string;
  birth_date!: Date;
  description!: string;
  breed!: Breed;
  rescueClass!: Rescue;
  photos: Photo[] = [];

  constructor(init?: Partial<Animal>) {
    Object.assign(this, init);
  }
}
