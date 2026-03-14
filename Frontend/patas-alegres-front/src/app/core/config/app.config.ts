import { environment } from '../../../environments/environment';

export const AppConfig = {
  apiUrl: environment.api.url,
  apiBase: environment.api.base,
  googleMapsApiKey: environment.googleMaps.apiKey,
  googleMapsMapId: environment.googleMaps.mapId
} as const;