'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  DropletIcon,
  WindIcon,
  ThermometerIcon,
  CloudSnowIcon,
  CloudRainIcon,
  CloudIcon,
  UmbrellaIcon,
  CloudDrizzleIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import GetWeatherIcon from '@/lib/utilities/open-meteo/weather/get-weather-icon/get-weather-icon';
import { CurrentWeather } from '@/lib/types/open-meteo/weather-api/weather-api';
import { Separator } from '@/components/ui/separator';

// For quickly converting Celsius -> Fahrenheit if you like:
function cToF(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * For quickly converting wind direction from degrees (meteorological)
 * to a textual compass direction, you can write a small helper:
 */
function directionToCompass(deg: number): string {
  // You can refine this if you want more precise naming.
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'] as const;
  // e.g. every 45 deg is a direction
  const idx = Math.round(deg / 45);
  return directions[idx] ?? 'N/A';
}

type WeatherCurrentPanelProps = {
  current: CurrentWeather; // containing all data.current fields
};

export default function WeatherCurrentPanel({
  current,
}: WeatherCurrentPanelProps) {
  const {
    time,
    temperature2m,
    relativeHumidity2m,
    apparentTemperature,
    isDay,
    precipitation,
    rain,
    showers,
    snowfall,
    weatherCode,
    cloudCover,
    pressureMsl,
    surfacePressure,
    windSpeed10m,
    windDirection10m,
    windGusts10m,
  } = current;

  const localTime = time
    ? format(time, 'PPpp') // e.g. "Jan 3, 2025 at 4:25 PM"
    : '';

  return (
    <Card className="p-4 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Current Weather</CardTitle>
        <CardDescription>
          {localTime} {isDay ? '(Day)' : '(Night)'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Top row: Large temperature + weather icon */}
        <div className="flex flex-wrap items-center justify-start gap-4">
          {/* Big temperature reading */}
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold leading-none">
              {Math.round(cToF(temperature2m))}°F
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-3xl text-gray-500">
              {Math.round(temperature2m)}°C
            </div>
          </div>
          <div className="text-6xl text-gray-400">
            {GetWeatherIcon(weatherCode)}
          </div>
        </div>

        {/* Additional details in a 2-col grid (on large screens) */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Feels like */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <ThermometerIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">Feels like</span>
              <span className="font-medium">
                {Math.round(apparentTemperature)}°C (
                {Math.round(cToF(apparentTemperature))}°F)
              </span>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <DropletIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">Humidity</span>
              <span className="font-medium">{relativeHumidity2m}%</span>
            </div>
          </div>

          {/* Precipitation (combined or per field) */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <UmbrellaIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">
                Precipitation
              </span>
              <span className="font-medium">{precipitation.toFixed(2)} mm</span>
            </div>
          </div>

          {/* If you want separate fields for rain, showers, snowfall: */}
          {/* Example: */}
          {rain > 0 && (
            <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
              <CloudRainIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col text-sm leading-tight">
                <span className="text-xs text-muted-foreground">Rain</span>
                <span className="font-medium">{rain.toFixed(2)} mm</span>
              </div>
            </div>
          )}
          {showers > 0 && (
            <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
              <CloudDrizzleIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col text-sm leading-tight">
                <span className="text-xs text-muted-foreground">Showers</span>
                <span className="font-medium">{showers.toFixed(2)} mm</span>
              </div>
            </div>
          )}
          {snowfall > 0 && (
            <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
              <CloudSnowIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col text-sm leading-tight">
                <span className="text-xs text-muted-foreground">Snowfall</span>
                <span className="font-medium">{snowfall.toFixed(2)} mm</span>
              </div>
            </div>
          )}

          {/* Cloud cover */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <CloudIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">Cloud Cover</span>
              <span className="font-medium">{cloudCover.toFixed(0)}%</span>
            </div>
          </div>

          {/* Pressure */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <ThermometerIcon className="h-5 w-5 rotate-90 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">Pressure</span>
              <span className="font-medium">
                {pressureMsl.toFixed(0)} hPa ({surfacePressure.toFixed(0)} hPa
                surface)
              </span>
            </div>
          </div>

          {/* Wind */}
          <div className="flex items-center space-x-2 rounded-lg bg-muted/30 p-2">
            <WindIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col text-sm leading-tight">
              <span className="text-xs text-muted-foreground">Wind</span>
              <span className="font-medium">
                {windSpeed10m.toFixed(1)} m/s
                {` ${directionToCompass(windDirection10m)}`}
                {windGusts10m > 0
                  ? ` (gusts up to ${windGusts10m.toFixed(1)} m/s)`
                  : ''}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        {/* You can add any extra actions or disclaimers here */}
        <span className="text-xs text-muted-foreground">
          Data provided by open-meteo.com
        </span>
      </CardFooter>
    </Card>
  );
}
