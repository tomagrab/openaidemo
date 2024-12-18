'use client';

import React, { useMemo } from 'react';
import {
  PolarGrid,
  RadialBar,
  RadialBarChart,
  PolarRadiusAxis,
  Label,
} from 'recharts';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface ReusableRadialChartProps<T extends Record<string, number | string>> {
  data: T[];
  config: ChartConfig;
  dataKey: keyof T;
  nameKey: keyof T;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

const ReusableRadialChart = <T extends Record<string, number | string>>({
  data,
  config,
  dataKey,
  nameKey,
  className = 'chart-container',
  innerRadius = 50,
  outerRadius = 100,
}: ReusableRadialChartProps<T>) => {
  const memoizedData = useMemo(() => data, [data]);

  const totalValue = useMemo(() => {
    return memoizedData.reduce(
      (sum, item) => sum + (item[dataKey] as number),
      0,
    );
  }, [memoizedData, dataKey]);

  return (
    <ChartContainer
      config={config}
      className={`min-h-[200px] w-full ${className}`}
    >
      <RadialBarChart
        data={memoizedData}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        barSize={15}
      >
        <PolarGrid gridType="circle" />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey={String(nameKey)} />}
        />
        <RadialBar
          dataKey={String(dataKey)}
          cornerRadius={5}
          fill="var(--color-primary)"
        />
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
                    className="fill-foreground text-3xl font-bold"
                  >
                    {totalValue.toLocaleString()}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 24}
                    className="fill-muted-foreground text-sm"
                  >
                    Total
                  </tspan>
                </text>
              );
            }
            return null;
          }}
        />
      </RadialBarChart>
    </ChartContainer>
  );
};

export default ReusableRadialChart;
