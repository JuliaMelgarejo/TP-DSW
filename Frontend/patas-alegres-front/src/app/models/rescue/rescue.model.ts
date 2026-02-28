export class City {
  constructor(
    public id: number = 0,
    public name: string = ''
  ) {}
}

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
    public street: string = '',
    public number_street: number | null = null,

    // En tu entity son obligatorias
    public shelters: number | Shelter | null = null,
    public city: number | City | null = null,

    public animals: AnimalLite[] = []
  ) {}
}