export type CurrentWeather = {
  time: Date;
  temperature2m: number;
  relativeHumidity2m: number;
  apparentTemperature: number;
  isDay: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressureMsl: number;
  surfacePressure: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
};

export type DailyWeather = {
  time: Date[];
  weatherCode: Float32Array<ArrayBufferLike>;
  temperature2mMax: Float32Array<ArrayBufferLike>;
  temperature2mMin: Float32Array<ArrayBufferLike>;
  apparentTemperatureMax: Float32Array<ArrayBufferLike>;
  apparentTemperatureMin: Float32Array<ArrayBufferLike>;
  sunrise: Float32Array<ArrayBufferLike>;
  sunset: Float32Array<ArrayBufferLike>;
  daylightDuration: Float32Array<ArrayBufferLike>;
  sunshineDuration: Float32Array<ArrayBufferLike>;
  uvIndexMax: Float32Array<ArrayBufferLike>;
  uvIndexClearSkyMax: Float32Array<ArrayBufferLike>;
  precipitationSum: Float32Array<ArrayBufferLike>;
  rainSum: Float32Array<ArrayBufferLike>;
  showersSum: Float32Array<ArrayBufferLike>;
  snowfallSum: Float32Array<ArrayBufferLike>;
  precipitationHours: Float32Array<ArrayBufferLike>;
  precipitationProbabilityMax: Float32Array<ArrayBufferLike>;
  windSpeed10mMax: Float32Array<ArrayBufferLike>;
  windGusts10mMax: Float32Array<ArrayBufferLike>;
  windDirection10mDominant: Float32Array<ArrayBufferLike>;
  shortwaveRadiationSum: Float32Array<ArrayBufferLike>;
  et0FaoEvapotranspiration: Float32Array<ArrayBufferLike>;
};

export type WeatherData = {
  current: CurrentWeather;
  daily: DailyWeather;
};

export type WeatherResponse = {
  latitude: number;
  longitude: number;
  timezone?: string | null;
  timezoneAbbreviation?: string | null;
  current: CurrentWeather;
  daily: DailyWeather;
};
