export type userLocation = {
  lat: number;
  lon: number;
  reverseGeocodingData?: {
    county: string;
    city: string;
    state: string;
  };
};
