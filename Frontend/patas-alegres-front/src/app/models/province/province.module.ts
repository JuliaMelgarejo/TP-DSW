
export class Province { 
  id: number;
  name: string;
  updatedAt: Date;
  createdAt: Date;
  country: number;
 

  constructor(id: number, name: string, updatedAt: Date, createdAt: Date, country: number) {
    this.id = id;
    this.name = name;
    this.updatedAt = updatedAt;
    this.createdAt = createdAt;
    this.country = country;
  }

}
