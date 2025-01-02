'use client';

import React, { useState } from 'react';
import ReusableBarChart from '@/components/ui/reusable-bar-chart';
import ReusableRadialChart from '@/components/ui/reusable-radial-chart';
import ReusableLineChart from '@/components/ui/reusable-line-chart';
import ReusableAreaChart from '@/components/ui/reusable-area-chart';
import ReusablePieChart from '@/components/ui/reusable-pie-chart';
import ChartDropdown from '@/components/ui/chart-dropdown';

type MarketsChartsProps = {
  markets: Prisma.MarketGetPayload<{
    select: {
      name: true;
      companies: {
        select: {
          name: true;
        };
      };
      industries: {
        select: {
          name: true;
        };
      };
    };
  }>[];
};

export default function MarketsCharts({ markets }: MarketsChartsProps) {
  const chartData = markets.map(market => ({
    market: market.name,
    companyCount: market.companies.length,
    industryCount: market.industries.length,
  }));

  const chartOptions = ['Bar', 'Line', 'Area', 'Pie', 'Radial'];
  const [selectedCharts, setSelectedCharts] = useState<string[]>(chartOptions);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex w-full items-center justify-between border-b border-border pb-2">
        <h2>Market Data</h2>
        <ChartDropdown
          options={chartOptions}
          selectedOptions={selectedCharts}
          onChange={setSelectedCharts}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 pt-2 md:grid-cols-5 lg:grid-cols-5">
        {selectedCharts.includes('Bar') && (
          <div>
            <ReusableBarChart
              data={chartData}
              config={{
                title: { label: 'Companies by Market' },
                xAxisLabel: { label: 'Market' },
                yAxisLabel: { label: 'Company Count' },
              }}
              dataKeys={['companyCount']}
              xAxisKey="market"
              key={selectedCharts.join('')}
            />
          </div>
        )}

        {selectedCharts.includes('Line') && (
          <div>
            <ReusableLineChart
              data={chartData}
              config={{
                title: { label: 'Companies by Market' },
                xAxisLabel: { label: 'Market' },
                yAxisLabel: { label: 'Company Count' },
              }}
              dataKeys={['companyCount']}
              xAxisKey="market"
            />
          </div>
        )}

        {selectedCharts.includes('Area') && (
          <div>
            <ReusableAreaChart
              data={chartData}
              config={{
                title: { label: 'Companies by Market' },
                xAxisLabel: { label: 'Market' },
                yAxisLabel: { label: 'Company Count' },
              }}
              dataKeys={['companyCount']}
              xAxisKey="market"
            />
          </div>
        )}

        {selectedCharts.includes('Pie') && (
          <div>
            <ReusablePieChart
              data={chartData}
              config={{ title: { label: 'Companies by Market' } }}
              valueKey="companyCount"
              nameKey="market"
            />
          </div>
        )}

        {selectedCharts.includes('Radial') && (
          <div>
            <ReusableRadialChart
              data={chartData}
              config={{ title: { label: 'Companies by Market' } }}
              dataKey="companyCount"
              nameKey="market"
              innerRadius={50}
              outerRadius={100}
            />
          </div>
        )}
      </div>
    </div>
  );
}
