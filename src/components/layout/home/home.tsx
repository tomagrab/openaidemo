'use client';

import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { useEffect, useState } from 'react';
import { getWeather } from '@/lib/function-calls/functions/get-weather/get-weather';
import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import WeatherDashboard from '@/components/layout/open-meteo/weather/weather-dashboard/weather-dashboard';
import { getReverseGeocodeData } from '@/lib/function-calls/functions/get-reverse-geocode-data/get-reverse-geocode-data';

export default function Home() {
  const { homePageContent, userLocation, setUserLocation } =
    useOpenAIDemoContext();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }
  }, [setUserLocation]);

  useEffect(() => {
    if (userLocation) {
      getWeather(userLocation.lat, userLocation.lon)
        .then(data => {
          setWeatherData(data);
        })
        .catch(error => {
          console.error('Failed to get weather data:', error);
        });

      getReverseGeocodeData(userLocation.lat, userLocation.lon)
        .then(data => {
          console.log('Reverse geocode data:', data);
        })
        .catch(error => {
          console.error('Failed to get reverse geocode data:', error);
        });
    }
  }, [userLocation]);

  return homePageContent ? (
    <div>
      <MarkdownRenderer content={homePageContent} />
      <WeatherDashboard data={weatherData} />
    </div>
  ) : null;
}
