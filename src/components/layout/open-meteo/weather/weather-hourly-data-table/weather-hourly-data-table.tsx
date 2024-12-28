'use client';

import React, { JSX, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/ui/data-table'; // or wherever your DataTable is located
import { Checkbox } from '@/components/ui/checkbox';
import DataTableColumnHeader from '@/components/ui/data-table-column-header';
import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';

// For icons
import { SunIcon, SnowflakeIcon, CloudIcon, CloudRainIcon } from 'lucide-react';

/**
 * 1) We'll define a row type so your DataTable can reference known fields:
 */
type DailyForecastRow = {
  id: number;
  date: Date; // daily.time[i]
  weatherCode: number; // daily.weatherCode[i]
  tempMin: number; // daily.temperature2mMin[i]
  tempMax: number; // daily.temperature2mMax[i]
  precipitation: number; // daily.precipitationSum[i] (in mm)
};

/**
 * 2) A helper function to map a numeric `weatherCode` to an icon.
 *    This is just a rough example. Expand or customize as desired.
 */
function getWeatherIcon(code: number): JSX.Element {
  // For demonstration:
  if (code === 0) return <SunIcon className="h-4 w-4 text-yellow-500" />;
  if (code < 50) return <CloudIcon className="h-4 w-4 text-gray-500" />;
  if (code < 60) return <CloudRainIcon className="h-4 w-4 text-blue-400" />;
  if (code < 80) return <SnowflakeIcon className="h-4 w-4 text-sky-600" />;
  return <CloudIcon className="h-4 w-4 text-gray-500" />;
}

/**
 * 3) The column definitions:
 */
const columns: ColumnDef<DailyForecastRow>[] = [
  // A "select" checkbox column for multi-row selection (optional).
  {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  // Date column
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      return (
        <span className="flex flex-col items-center justify-center">
          {date.toDateString()}
        </span>
      );
    },
  },

  // Temperature Min
  {
    accessorKey: 'tempMin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Min(°F) | (°C)" />
    ),
    cell: ({ row }) => {
      const val = row.original.tempMin;
      return (
        <span className="flex flex-col items-center justify-center">
          {Math.round(val * 1.8 + 32)}°F | {Math.round(val)}°C
        </span>
      );
    },
  },
  // Temperature Max
  {
    accessorKey: 'tempMax',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max(°F) | (°C)" />
    ),
    cell: ({ row }) => {
      const val = row.original.tempMax;
      return (
        <span className="flex flex-col items-center justify-center">
          {Math.round(val * 1.8 + 32)}°F | {Math.round(val)}°C
        </span>
      );
    },
  },
  // Precipitation
  {
    accessorKey: 'precipitation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precipitation (mm)" />
    ),
    cell: ({ row }) => {
      // Set to two decimal places
      const val = row.original.precipitation.toFixed(2);
      return (
        <span className="flex flex-col items-center justify-center">
          {val}mm
        </span>
      );
    },
  },
  // Weather icon
  {
    id: 'weatherCode',
    header: () => (
      <div className="flex w-full items-center justify-center">
        <p>Weather</p>
      </div>
    ),
    cell: ({ row }) => {
      const code = row.original.weatherCode;
      return (
        <span className="flex flex-col items-center justify-center">
          {getWeatherIcon(code)}
        </span>
      );
    },
  },
];

/**
 * 4) The main DataTable component.
 */
type WeatherDailyDataTableProps = {
  data: WeatherResponse | null;
};

export default function WeatherDailyDataTable({
  data,
}: WeatherDailyDataTableProps) {
  // Convert the "daily" arrays into an array of row objects:
  const tableData: DailyForecastRow[] = useMemo(() => {
    if (!data || !data.daily) return [];
    const { daily } = data;

    // We'll assume all arrays are the same length
    const length = daily.time.length;
    const rows: DailyForecastRow[] = [];
    for (let i = 0; i < length; i++) {
      rows.push({
        id: i,
        date: daily.time[i],
        weatherCode: daily.weatherCode[i],
        tempMin: daily.temperature2mMin[i],
        tempMax: daily.temperature2mMax[i],
        precipitation: daily.precipitationSum[i],
      });
    }
    return rows;
  }, [data]);

  // If no data or no daily rows, return fallback
  if (!tableData.length) {
    return (
      <div className="p-4 text-gray-500">
        <em>No daily forecast data.</em>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={tableData}
      filterPlaceholder="Filter daily forecast..."
    />
  );
}
