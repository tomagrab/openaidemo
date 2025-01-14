import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';

export const getWeather = async (latitude: number, longitude: number) => {
  let apiUrl = '/api/open-meteo/get-weather';

  if (latitude && longitude) {
    apiUrl += `?lat=${latitude}&lon=${longitude}`;
  }

  const response = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      'Failed to fetch weather data. Response: ' + response.statusText,
    );
  }

  const data: WeatherResponse = await response.json();

  return data;
};
