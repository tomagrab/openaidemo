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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';

// Our Reusable charts:
import ReusableLineChart from '@/components/ui/reusable-line-chart';
import ReusableBarChart from '@/components/ui/reusable-bar-chart';

// We'll define a sample ChartConfig for daily data
import { ChartConfig } from '@/components/ui/chart';

type WeatherDailyPanelProps = {
  data: WeatherResponse;
};

export default function WeatherDailyPanel({ data }: WeatherDailyPanelProps) {
  // 1) Derive or transform `data.daily` into a shape the charts can read easily
  //    Suppose we create an array of objects:
  //    {
  //       dateStr: string,
  //       tempMax: number,
  //       tempMin: number
  //    } for each day
  const dailyRows = data.daily.time.map((dateObj, idx) => {
    return {
      // Convert dateObj to something like "12/25" or "Dec 25"
      dateStr: format(dateObj, 'LLL d'),
      tempMax: Number(data.daily.temperature2mMax[idx] || 0),
      tempMin: Number(data.daily.temperature2mMin[idx] || 0),
    };
  });

  // 2) Define a chart config for the two data keys (tempMax & tempMin).
  //    We can specify label, color, etc. to match your brand or indicate difference
  const dailyChartConfig: ChartConfig = {
    tempMax: {
      label: 'Max Temp (°C)',
      color: 'red',
    },
    tempMin: {
      label: 'Min Temp (°C)',
      color: 'blue',
    },
  };

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
        {/* TABS */}
        <Tabs defaultValue="line" className="w-full">
          <TabsList>
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          {/* 1) LINE CHART TAB */}
          <TabsContent value="line">
            <ReusableLineChart
              data={dailyRows}
              config={dailyChartConfig}
              dataKeys={['tempMax', 'tempMin']}
              xAxisKey="dateStr"
            />
          </TabsContent>

          {/* 2) BAR CHART TAB */}
          <TabsContent value="bar">
            <ReusableBarChart
              data={dailyRows}
              config={dailyChartConfig}
              dataKeys={['tempMax', 'tempMin']}
              xAxisKey="dateStr"
            />
          </TabsContent>

          {/* 3) TABLE TAB */}
          <TabsContent value="table">
            <WeatherHourlyDataTable data={data} />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="justify-end">
        <span className="text-xs text-muted-foreground">
          Data provided by open-meteo.com
        </span>
      </CardFooter>
    </Card>
  );
}
