import { NextResponse } from 'next/server';

const baseGoogleApiGeocodingUrl = new URL(
  'https://maps.googleapis.com/maps/api/geocode/json',
);

export async function GET(request: Request): Promise<NextResponse | Response> {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    console.log('lat', lat);
    console.log('lon', lon);

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing lat or lon query parameter' },
        { status: 400 },
      );
    }

    const latlng = `${lat},${lon}`;

    console.log('latlng', latlng);

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing Google API key' },
        { status: 400 },
      );
    }

    baseGoogleApiGeocodingUrl.searchParams.set('latlng', latlng);
    baseGoogleApiGeocodingUrl.searchParams.set('key', apiKey);

    console.log(
      'baseGoogleApiGeocodingUrl',
      baseGoogleApiGeocodingUrl.toString(),
    );

    const response = await fetch(baseGoogleApiGeocodingUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch geocoding data' },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
