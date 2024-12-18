'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

interface ReusableAreaChartProps<T extends Record<string, number | string>> {
  // The chart data to render, where each object represents a row of data
  data: T[];
  // Configuration object for chart labels, colors, etc.
  config: ChartConfig;
  // The keys in the data array to be displayed in the chart
  dataKeys: Array<Extract<keyof T, string | number>>;
  // The key to use for the X-axis labels
  xAxisKey: Extract<keyof T, string>;
  // Optional CSS class to apply additional styling to the chart container
  className?: string;
}

const ReusableAreaChart = <T extends Record<string, number | string>>({
  data,
  config,
  dataKeys,
  xAxisKey,
  className = 'chart-container',
}: ReusableAreaChartProps<T>) => {
  // Memoize the data to prevent unnecessary re-renders when the data doesn't change
  const memoizedData = useMemo(() => data, [data]);

  // Filter and validate dataKeys to ensure they exist in the data objects
  const validDataKeys = useMemo(() => {
    const dataKeysSet = new Set(Object.keys(data[0] || {}));
    return dataKeys.filter(key => dataKeysSet.has(String(key)));
  }, [data, dataKeys]);

  // Check for missing CSS variables corresponding to the dataKeys and log a warning
  const missingColorKeys = validDataKeys.filter(
    key =>
      !(
        `--color-${String(key).toLowerCase()}` in document.documentElement.style
      ),
  );

  if (missingColorKeys.length > 0) {
    console.warn(
      `Missing CSS variables for the following keys: ${missingColorKeys.join(', ')}`,
    );
  }

  return (
    <ChartContainer
      // Pass the chart configuration for theming and customization
      config={config}
      // Apply the default and optional classes to the chart container
      className={`min-h-[200px] w-full ${className}`}
    >
      <AreaChart data={memoizedData} margin={{ left: 12, right: 12 }}>
        {/* Add a background grid to the chart */}
        <CartesianGrid vertical={false} />
        {/* Configure the X-axis with formatted labels */}
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={value =>
            typeof value === 'string' ? value.slice(0, 3) : ''
          }
        />
        {/* Add a tooltip for interactive data exploration */}
        <ChartTooltip content={<ChartTooltipContent />} />
        {/* Add a legend to describe the data series */}
        <ChartLegend content={<ChartLegendContent />} />
        {/* Render areas for each valid data key, applying corresponding colors */}
        {validDataKeys.map(key => (
          <Area
            key={String(key)}
            dataKey={key}
            type="natural"
            fill={`var(--color-${String(key).toLowerCase()})`}
            fillOpacity={0.4}
            stroke={`var(--color-${String(key).toLowerCase()})`}
            stackId="a"
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

export default ReusableAreaChart;
