'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Sector, Label, SectorProps } from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ReusablePieChartProps<T extends Record<string, number | string>> {
  // The chart data to render, where each object represents a data slice
  data: T[];
  // Configuration object for chart labels, colors, etc.
  config: ChartConfig;
  // The key in the data array to be used for the value of each slice
  valueKey: Extract<keyof T, string>;
  // The key to use for the label of each slice
  nameKey: Extract<keyof T, string>;
  // Optional CSS class to apply additional styling to the chart container
  className?: string;
}

const ReusablePieChart = <T extends Record<string, number | string>>({
  data,
  config,
  valueKey,
  nameKey,
  className = 'chart-container',
}: ReusablePieChartProps<T>) => {
  // Memoize the total value to prevent unnecessary re-calculations
  const totalValue = useMemo(
    () => data.reduce((sum, item) => sum + Number(item[valueKey]), 0),
    [data, valueKey],
  );

  // Memoize the colors and labels from the configuration
  const sliceConfig = useMemo(
    () =>
      data.map(item => ({
        name: item[nameKey],
        value: Number(item[valueKey]),
        fill: `var(--color-${String(item[nameKey]).toLowerCase()})`,
      })),
    [data, nameKey, valueKey],
  );

  return (
    <ChartContainer
      config={config}
      className={`mx-auto aspect-square w-full ${className}`}
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={sliceConfig}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={80}
          strokeWidth={5}
          activeShape={(props: SectorProps) => (
            <Sector
              {...props}
              outerRadius={(props.outerRadius ?? 80) + 10}
              innerRadius={props.innerRadius}
            />
          )}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {totalValue.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground"
                    >
                      Total
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};

export default ReusablePieChart;
