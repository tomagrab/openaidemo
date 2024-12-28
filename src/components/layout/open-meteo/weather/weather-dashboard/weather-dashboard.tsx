'use client';

import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import WeatherHourlyDataTable from '../weather-hourly-data-table/weather-hourly-data-table';

type WeatherDashboardProps = {
  data: WeatherResponse | null;
};

export default function WeatherDashboard({ data }: WeatherDashboardProps) {
  // If no data, you might want to show a spinner or "No Data" text
  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        <em>No weather data</em>
      </div>
    );
  }

  // Extract fields from your data
  const { timezone, timezoneAbbreviation } = data;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">
        Weather for {timezone} ({timezoneAbbreviation})
      </h2>

      {/* Hourly forecast */}
      <WeatherHourlyDataTable data={data} />
    </div>
  );
}
