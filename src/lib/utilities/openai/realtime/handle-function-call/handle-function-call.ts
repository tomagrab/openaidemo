import { searchDocuments } from '@/app/server/actions/documents/document-actions/document-actions';
import { createUserAction } from '@/app/server/actions/users/user-actions/user-actions';
import { getReverseGeocodeData } from '@/lib/function-calls/functions/get-reverse-geocode-data/get-reverse-geocode-data';
import { getWeather } from '@/lib/function-calls/functions/get-weather/get-weather';
import { userLocation } from '@/lib/types/context/user-location/user-location';
import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import { parseReverseGeocode } from '@/lib/utilities/google/google-reverse-geocode/google-reverse-geocode';
import { RefObject } from 'react';

export async function handleFunctionCall(
  dcRef: RefObject<RTCDataChannel | null>,
  fnCallItem: {
    [key: string]: unknown;
    id?: string;
    type?: 'message' | 'function_call' | 'function_call_output';
    content?: Array<{
      type?: 'text' | 'input_text' | 'input_audio' | 'item_reference';
      text?: string;
      audio?: string;
      transcript?: string;
    }>;
  },
  setHeaderEmoji: (emoji: string) => void,
  setTheme: (theme: string) => void,
  setHomePageContent: (content: string) => void,
  setUserLocation: React.Dispatch<React.SetStateAction<userLocation | null>>,
  setWeatherData: React.Dispatch<React.SetStateAction<WeatherResponse | null>>,
) {
  const parsedArgs =
    typeof fnCallItem.arguments === 'string'
      ? JSON.parse(fnCallItem.arguments)
      : fnCallItem.arguments;

  switch (fnCallItem.name) {
    case 'setHeaderEmoji':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'emoji' in parsedArgs &&
          typeof parsedArgs.emoji === 'string'
        ) {
          setHeaderEmoji(parsedArgs.emoji);
        }

        // Then ask the model to respond:
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id, // must match
              output: JSON.stringify({ success: true }),
            },
          }),
        );

        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        console.error('Error setting header emoji:', error);
      }
      break;
    case 'setTheme':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'theme' in parsedArgs &&
          typeof parsedArgs.theme === 'string'
        ) {
          setTheme(parsedArgs.theme);
        }

        // Then ask the model to respond:
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id, // must match
              output: JSON.stringify({ success: true }),
            },
          }),
        );

        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        console.error('Error setting theme:', error);
      }
      break;
    case 'setHomePageContent':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'content' in parsedArgs &&
          typeof parsedArgs.content === 'string'
        ) {
          setHomePageContent(parsedArgs.content);
        }

        // Then ask the model to respond:
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id, // must match
              output: JSON.stringify({ success: true }),
            },
          }),
        );

        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        console.error('Error setting home page content:', error);
      }
      break;
    case 'getWeather':
      try {
        let lat = parsedArgs?.lat as number | undefined;
        let lon = parsedArgs?.lon as number | undefined;

        // If lat/lon not provided, attempt browser geolocation
        if (!lat || !lon) {
          if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
            console.log(
              'getWeather: no lat/lon provided, calling geolocation...',
            );
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
              },
            );
            lat = position.coords.latitude;
            lon = position.coords.longitude;
          } else {
            console.error('Browser geolocation not available');
            return;
          }
        }

        // At this point, lat/lon should be set. Let’s store that in context.
        setUserLocation({ lat, lon });

        // Reverse geocode
        const reverseData = await getReverseGeocodeData(lat, lon);
        const { county, city, state } = parseReverseGeocode(reverseData);
        if (county && city && state) {
          setUserLocation({
            lat,
            lon,
            reverseGeocodingData: { county, city, state },
          });
        } else {
          console.warn('getWeather: could not parse reverse geocode data');
        }

        // Then weather
        const weather = await getWeather(lat, lon);
        setWeatherData(weather);
        // This (setWeatherData) triggers your <WeatherPage> or <WeatherDashboard> to show the UI.

        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id, // must match
              output: JSON.stringify({
                success: true,
                location: { lat, lon },
                city,
                state,
                county,
                weather,
              }),
            },
          }),
        );

        // Then ask the model to respond:
        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (err) {
        console.error('Error in getWeather logic:', err);
      }
      break;

    case 'searchDocuments':
      try {
        // 1) parse query & limit
        const query = parsedArgs?.query ?? '';
        const limit = parsedArgs?.limit ?? 10;

        // 2) call the server action
        const result = await searchDocuments(query, limit);

        // 3) If an error was returned:
        if ('error' in result) {
          // Possibly send a function_call_output with error
          dcRef.current?.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: fnCallItem.call_id,
                output: JSON.stringify({
                  success: false,
                  error: result.error,
                }),
              },
            }),
          );
          // Optionally ask the model to respond
          dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
          return;
        }

        // 4) success
        // The server action gave us "documents"
        const documents = result.documents; // or null
        // You might want to craft a short textual summary of those documents

        // Let's build a "summary" string for the model
        const summary =
          documents && documents.length > 0
            ? documents
                .map(doc => {
                  return `Title: ${doc.title}\nContent snippet: ${
                    doc.content?.slice(0, 100) ?? ''
                  }...`;
                })
                .join('\n\n')
            : 'No matching documents found.';

        // 5) Send function_call_output back to model
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id,
              output: JSON.stringify({
                success: true,
                count: documents?.length ?? 0,
                documents: documents ?? [],
                summary,
              }),
            },
          }),
        );

        // 6) Then instruct the model to produce a final response:
        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        console.error('Error in searchDocuments logic:', error);
        // Possibly pass a partial function_call_output with error
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id,
              output: JSON.stringify({
                success: false,
                error: String(error),
              }),
            },
          }),
        );
        // Model can respond
        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      }
      break;
    case 'createUser':
      try {
        // 1) Parse the arguments
        const { firstName, lastName, email, username, password } = parsedArgs;

        // 2) Check if the arguments are valid
        if (
          !firstName.trim() ||
          !lastName.trim() ||
          !email.trim() ||
          !username.trim() ||
          !password.trim()
        ) {
          // Ask the user to provide all fields
          dcRef.current?.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: fnCallItem.call_id,
                output: JSON.stringify({
                  success: false,
                  error: 'Please provide all fields',
                }),
              },
            }),
          );

          // Optionally ask the model to respond
          dcRef.current?.send(JSON.stringify({ type: 'response.create' }));

          return;
        }

        // 3) Call the server action
        const createdUser = await createUserAction({
          firstName,
          lastName,
          email,
          username,
          password,
        });

        // 4) If an error was returned:
        if ('error' in createdUser) {
          // Possibly send a function_call_output with error
          dcRef.current?.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'function_call_output',
                call_id: fnCallItem.call_id,
                output: JSON.stringify({
                  success: false,
                  error: createdUser.error,
                }),
              },
            }),
          );

          // Optionally ask the model to respond
          dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
          return;
        }

        // 5) If success
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id,
              output: JSON.stringify({
                success: true,
                user: createdUser, // e.g. the new user
              }),
            },
          }),
        );

        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Error in createUser logic:', errorMessage);
        // Possibly pass an error object back to the model
        dcRef.current?.send(
          JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: fnCallItem.call_id,
              output: JSON.stringify({
                success: false,
                error: errorMessage,
              }),
            },
          }),
        );
        dcRef.current?.send(JSON.stringify({ type: 'response.create' }));
      }
      break;
    default:
      console.log('Unhandled function call:', fnCallItem);
      break;
  }
}
