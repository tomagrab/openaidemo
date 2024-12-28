/**
 * The Realtime model can call "getWeather" with optional `lat` + `lon` if the user
 * asked "What's the weather in Rome?" and the model recognized coordinates. Or it might
 * call it with no arguments and rely on the user’s browser geolocation.
 *
 * You can define additional properties if needed.
 */
export const getWeatherDefinition = {
  type: 'function',
  name: 'getWeather',
  description: `Fetches user weather data.
     1) If lat/lon provided, use them.
     2) Otherwise, get user geolocation from the browser.
     3) Then do reverse geocoding + open-meteo weather fetch.
     4) Finally, display the weather UI (WeatherPage + WeatherDashboard).`,
  parameters: {
    type: 'object',
    properties: {
      lat: {
        type: 'number',
        description:
          'User latitude. If omitted, the function tries to get it from the browser geolocation.',
      },
      lon: {
        type: 'number',
        description:
          'User longitude. If omitted, the function tries to get it from the browser geolocation.',
      },
    },
    required: [],
  },
};
