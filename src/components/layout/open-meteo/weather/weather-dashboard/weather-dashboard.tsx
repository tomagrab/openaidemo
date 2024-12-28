'use client';

import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';

import WeatherCurrentPanel from '@/components/layout/open-meteo/weather/weather-current-panel/weather-current-panel';
import WeatherDailyPanel from '@/components/layout/open-meteo/weather/weather-daily-panel/weather-daily-panel';

type WeatherDashboardProps = {
  data: WeatherResponse | null;
  reverseLocation: {
    county: string;
    city: string;
    state: string;
  };
};

export default function WeatherDashboard({
  data,
  reverseLocation,
}: WeatherDashboardProps) {
  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        <em>No weather data</em>
      </div>
    );
  }

  // Extract fields from your data
  const { county, city, state } = reverseLocation || {};
  const { timezoneAbbreviation } = data;

  // Build a header or display text for daily forecast
  const dailyForecastHeader = [
    county || '',
    city || '',
    state || '',
    timezoneAbbreviation || '',
    'Daily Forecast',
  ]
    .filter(Boolean)
    .join(' | ');

  const currentForecastHeader = [
    county || '',
    city || '',
    state || '',
    timezoneAbbreviation || '',
    'Current Forecast',
  ]
    .filter(Boolean)
    .join(' | ');

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Current weather panel */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{currentForecastHeader}</h2>
        <WeatherCurrentPanel current={data.current} />
      </div>

      {/* Daily / hourly forecast */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{dailyForecastHeader}</h2>
        <WeatherDailyPanel data={data} />
      </div>
    </div>
  );
}
