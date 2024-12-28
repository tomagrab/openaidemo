import {
  WeatherData,
  WeatherResponse,
} from '@/lib/types/open-meteo/weather-api/weather-api';
import { NextResponse } from 'next/server';
import { fetchWeatherApi } from 'openmeteo';

export async function GET(
  request: Request,
): Promise<NextResponse<WeatherResponse> | Response> {
  try {
    const { searchParams } = new URL(request.url);

    // Only take up to 2 decimal places
    const bigLat = searchParams.get('lat');
    const bigLon = searchParams.get('lon');

    const lat = bigLat ? parseFloat(bigLat).toFixed(2) : null;
    const lon = bigLon ? parseFloat(bigLon).toFixed(2) : null;

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing lat or lon query parameter' },
        { status: 400 },
      );
    }

    const params = {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ],
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'daylight_duration',
        'sunshine_duration',
        'uv_index_max',
        'uv_index_clear_sky_max',
        'precipitation_sum',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum',
        'et0_fao_evapotranspiration',
      ],
      timezone: 'auto',
      timezoneAbbreviation: 'auto',
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params);

    // Helper function to form time ranges
    const range = (start: number, stop: number, step: number) =>
      Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const current = response.current()!;
    const daily = response.daily()!;

    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData: WeatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature2m: current.variables(0)!.value(),
        relativeHumidity2m: current.variables(1)!.value(),
        apparentTemperature: current.variables(2)!.value(),
        isDay: current.variables(3)!.value(),
        precipitation: current.variables(4)!.value(),
        rain: current.variables(5)!.value(),
        showers: current.variables(6)!.value(),
        snowfall: current.variables(7)!.value(),
        weatherCode: current.variables(8)!.value(),
        cloudCover: current.variables(9)!.value(),
        pressureMsl: current.variables(10)!.value(),
        surfacePressure: current.variables(11)!.value(),
        windSpeed10m: current.variables(12)!.value(),
        windDirection10m: current.variables(13)!.value(),
        windGusts10m: current.variables(14)!.value(),
      },
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval(),
        ).map(t => new Date((t + utcOffsetSeconds) * 1000)),
        weatherCode: daily.variables(0)!.valuesArray()!,
        temperature2mMax: daily.variables(1)!.valuesArray()!,
        temperature2mMin: daily.variables(2)!.valuesArray()!,
        apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
        apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
        sunrise: daily.variables(5)!.valuesArray()!,
        sunset: daily.variables(6)!.valuesArray()!,
        daylightDuration: daily.variables(7)!.valuesArray()!,
        sunshineDuration: daily.variables(8)!.valuesArray()!,
        uvIndexMax: daily.variables(9)!.valuesArray()!,
        uvIndexClearSkyMax: daily.variables(10)!.valuesArray()!,
        precipitationSum: daily.variables(11)!.valuesArray()!,
        rainSum: daily.variables(12)!.valuesArray()!,
        showersSum: daily.variables(13)!.valuesArray()!,
        snowfallSum: daily.variables(14)!.valuesArray()!,
        precipitationHours: daily.variables(15)!.valuesArray()!,
        precipitationProbabilityMax: daily.variables(16)!.valuesArray()!,
        windSpeed10mMax: daily.variables(17)!.valuesArray()!,
        windGusts10mMax: daily.variables(18)!.valuesArray()!,
        windDirection10mDominant: daily.variables(19)!.valuesArray()!,
        shortwaveRadiationSum: daily.variables(20)!.valuesArray()!,
        et0FaoEvapotranspiration: daily.variables(21)!.valuesArray()!,
      },
    };

    const completeWeatherData: WeatherResponse = {
      latitude,
      longitude,
      timezone,
      timezoneAbbreviation,
      current: weatherData.current,
      daily: weatherData.daily,
    };

    return NextResponse.json(completeWeatherData);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: errorMessage },
      { status: 500 },
    );
  }
}
