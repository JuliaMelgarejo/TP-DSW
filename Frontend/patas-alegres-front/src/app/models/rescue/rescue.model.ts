import { Address } from "../address/address.js";

export class Shelter {
  constructor(
    public id: number = 0,
    public name: string = ''
  ) {}
}

export class AnimalLite {
  constructor(
    public name: string = '',
    public birth_date: string | null = null,
    public description: string,

    // ✅ dropdown
    public breed: number | null = null,
    public photoFile?: File | null,      // ✅ opcional
    public photoPreviewUrl?: string | null
  ) {}
}

export class Rescue {
  constructor(
    public id?: number,

    public rescue_date: string = '',       // yyyy-mm-dd para el input
    public description: string = '',
    public comments: string = '',

    // En tu entity son obligatorias
    public shelters: number | Shelter | null = null,
    public address: Address | number | null = null,

    public animals: AnimalLite[] = []
  ) {}
}