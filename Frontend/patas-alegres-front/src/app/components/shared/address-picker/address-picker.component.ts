import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnInit
} from '@angular/core';

import { FormGroup } from '@angular/forms';
import { GoogleMap, MapAdvancedMarker } from '@angular/google-maps';
import { environment } from '../../../../environments/environments.local.js';

@Component({
  selector: 'app-address-picker',
  standalone: true,
  imports: [CommonModule, GoogleMap, MapAdvancedMarker],
  templateUrl: './address-picker.component.html',
  styleUrl: './address-picker.component.css'
})
export class AddressPickerComponent implements OnInit, AfterViewInit {

  @ViewChild('addressInput') addressInput!: ElementRef;
  @ViewChild(GoogleMap) map!: GoogleMap;

  @Input() form!: FormGroup;

  center: google.maps.LatLngLiteral = { lat: -38.416097, lng: -63.616672 };
  zoom = 5;

  markerPosition?: google.maps.LatLngLiteral;

  mapOptions: google.maps.MapOptions = {
    mapId: environment.googleMapsMapId,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false
  };
  private geocoder = new google.maps.Geocoder();

  ngOnInit() {
    this.form.valueChanges.subscribe(value => {
      const lat = value.latitude;
      const lng = value.longitude;
      if (!lat || !lng) return;
      const coords = {
        lat: Number(lat),
        lng: Number(lng)
      };
      this.center = coords;
      this.markerPosition = coords;
      this.zoom = 15;
      if (this.map) {
        this.map.panTo(coords);
        this.map.googleMap?.setZoom(15);
      }
      if (value.formattedAddress && this.addressInput) {
        this.addressInput.nativeElement.value = value.formattedAddress;
      }
    });
  }

  ngAfterViewInit() {
    const formatted = this.form.value.formattedAddress;

    if (formatted) {
      this.addressInput.nativeElement.value = formatted;
    }

    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      {
        componentRestrictions: { country: 'ar' },
        fields: [
          'formatted_address',
          'geometry',
          'place_id',
          'address_components'
        ]
      }
    );

    autocomplete.addListener('place_changed', () => {

      const place = autocomplete.getPlace();
      if (!place.geometry || !place.address_components) return;

      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();

      const coords = { lat: lat!, lng: lng! };

      this.markerPosition = coords;
      this.map.panTo(coords);
      this.map.googleMap?.setZoom(15);

      const components = place.address_components;

      const getComponent = (type: string) =>
        components.find(c => c.types.includes(type))?.long_name || '';

      this.form.patchValue({
        latitude: lat,
        longitude: lng,
        formattedAddress: place.formatted_address,
        placeId: place.place_id,
        street: getComponent('route'),
        streetNumber: getComponent('street_number'),
        city: getComponent('locality'),
        postalCode: getComponent('postal_code'),
        province: getComponent('administrative_area_level_1'),
        country: getComponent('country')
      });

    });

  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;
    const coords = event.latLng.toJSON();
    this.markerPosition = coords;
    this.map.panTo(coords);
    this.geocoder.geocode(
      { location: coords },
      (results, status) => {
        if (status !== 'OK' || !results || !results.length) return;
        const result = results[0];
        const components = result.address_components;
        const getComponent = (type: string) =>
          components.find(c => c.types.includes(type))?.long_name || '';
        const address = {
          latitude: coords.lat,
          longitude: coords.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          street: getComponent('route'),
          streetNumber: getComponent('street_number'),
          city: getComponent('locality'),
          postalCode: getComponent('postal_code'),
          province: getComponent('administrative_area_level_1'),
          country: getComponent('country')
        };
        this.form.patchValue(address);
        if (this.addressInput) {
          this.addressInput.nativeElement.value = result.formatted_address;
        }
      }
    );
  }
}