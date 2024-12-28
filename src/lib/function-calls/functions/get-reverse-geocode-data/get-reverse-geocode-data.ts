export const getReverseGeocodeData = async (
  latitude: number,
  longitude: number,
) => {
  let apiUrl = '/api/google/geocoding/reverse-geocoding';

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

  const data = await response.json();

  return data;
};
