'use client';

import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import WeatherDashboard from '@/components/layout/open-meteo/weather/weather-dashboard/weather-dashboard';

export default function WeatherPage() {
  const { userLocation, weatherData } = useOpenAIDemoContext();

  return (
    <>
      {weatherData && userLocation?.reverseGeocodingData ? (
        <div>
          <WeatherDashboard
            data={weatherData}
            reverseLocation={userLocation.reverseGeocodingData}
          />
        </div>
      ) : null}
    </>
  );
}
