import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import WeatherHourlyDataTable from '@/components/layout/open-meteo/weather/weather-hourly-data-table/weather-hourly-data-table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { format } from 'date-fns';

type WeatherDailyPanelProps = {
  data: WeatherResponse;
};

export default function WeatherDailyPanel({ data }: WeatherDailyPanelProps) {
  return (
    <Card className="p-4 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Daily Weather</CardTitle>
        <CardDescription>
          {format(data.daily.time[0], 'PP')} -{' '}
          {format(data.daily.time[data.daily.time.length - 1], 'PP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WeatherHourlyDataTable data={data} />
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
