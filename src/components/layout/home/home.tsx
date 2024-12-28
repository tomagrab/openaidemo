'use client';

import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { useEffect, useState } from 'react';
import { getWeather } from '@/lib/function-calls/functions/get-weather/get-weather';
import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import WeatherDashboard from '@/components/layout/open-meteo/weather/weather-dashboard/weather-dashboard';
import { getReverseGeocodeData } from '@/lib/function-calls/functions/get-reverse-geocode-data/get-reverse-geocode-data';
import { parseReverseGeocode } from '@/lib/utilities/google/google-reverse-geocode/google-reverse-geocode';

export default function Home() {
  const { homePageContent, userLocation, setUserLocation } =
    useOpenAIDemoContext();
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);

  useEffect(() => {
    if (!userLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Now set in our context:
            setUserLocation({ lat, lon });
          },
          error => {
            console.error('Geolocation error:', error);
            // Optionally handle error, fallback, etc.
          },
        );
      } else {
        console.error('navigator.geolocation not available in this browser');
      }
    }
  }, [userLocation, setUserLocation]);

  useEffect(() => {
    if (!userLocation) return; // no lat/lon yet
    if (userLocation.reverseGeocodingData) return; // already have data

    // Fetch weather
    getWeather(userLocation.lat, userLocation.lon)
      .then(data => setWeatherData(data))
      .catch(error => console.error('Failed to get weather data:', error));

    // Reverse geocode
    getReverseGeocodeData(userLocation.lat, userLocation.lon)
      .then(data => {
        console.log('Reverse geocode data:', data);
        const { county, city, state } = parseReverseGeocode(data);
        if (!county || !city || !state) {
          console.error('Failed to parse reverse geocode data:', data);
          return;
        }
        // update context with reverse geocoding info
        setUserLocation({
          ...userLocation,
          reverseGeocodingData: { county, city, state },
        });
      })
      .catch(error =>
        console.error('Failed to get reverse geocode data:', error),
      );
  }, [userLocation, setUserLocation]);

  return homePageContent ? (
    <div>
      <MarkdownRenderer content={homePageContent} />
      {weatherData && userLocation?.reverseGeocodingData ? (
        <WeatherDashboard
          data={weatherData}
          reverseLocation={userLocation.reverseGeocodingData}
        />
      ) : null}
    </div>
  ) : null;
}
