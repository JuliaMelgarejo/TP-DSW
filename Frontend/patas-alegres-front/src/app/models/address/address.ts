export class Address {
  id?: number;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
  street?: string;
  streetNumber?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;

  constructor(latitude: number, longitude: number, formattedAddress?: string, placeId?: string, street?: string, streetNumber?: string, city?: string, postalCode?: string, province?: string, country?: string, id?: number) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.formattedAddress = formattedAddress;
    this.placeId = placeId;
    this.street = street;
    this.streetNumber = streetNumber;
    this.city = city;
    this.postalCode = postalCode;
    this.province = province;
    this.country = country;
    this.id = id;
  }
}