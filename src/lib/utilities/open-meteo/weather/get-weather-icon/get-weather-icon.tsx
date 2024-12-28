import { CloudIcon, CloudRainIcon, SnowflakeIcon, SunIcon } from 'lucide-react';
import { JSX } from 'react';

export default function GetWeatherIcon(code: number): JSX.Element {
  // For demonstration:
  if (code === 0) {
    return <SunIcon className="h-4 w-4 text-yellow-500" />;
  }

  if (code < 50) {
    return <CloudIcon className="h-4 w-4 text-gray-500" />;
  }

  if (code < 60) {
    return <CloudRainIcon className="h-4 w-4 text-blue-400" />;
  }

  if (code < 80) {
    return <SnowflakeIcon className="h-4 w-4 text-sky-600" />;
  }

  return <CloudIcon className="h-4 w-4 text-gray-500" />;
}
