type ParsedLocation = {
  county?: string;
  city?: string;
  state?: string;
};

type GoogleGeocodingResult = {
  address_components?: Array<{
    short_name: string;
    types: string[];
  }>;
};

type GoogleGeocodingResponse = {
  results?: GoogleGeocodingResult[];
};

// You can shape this however you want
export function parseReverseGeocode(
  data: GoogleGeocodingResponse,
): ParsedLocation {
  // We'll iterate through all results and address components,
  // once we find a match, we'll store it.
  let county: string | undefined;
  let city: string | undefined;
  let state: string | undefined;

  if (data?.results?.length) {
    for (const result of data.results) {
      if (!result.address_components) continue;

      for (const comp of result.address_components) {
        const types: string[] = comp.types || [];

        if (!county && types.includes('administrative_area_level_2')) {
          county = comp.short_name;
        }
        if (!city && types.includes('locality')) {
          city = comp.short_name;
        }
        if (!state && types.includes('administrative_area_level_1')) {
          state = comp.short_name;
        }

        // If we've found all three, we can break out early:
        if (county && city && state) {
          break;
        }
      }

      if (county && city && state) {
        // break from outer loop as well
        break;
      }
    }
  }

  return { county, city, state };
}
