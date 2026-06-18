'use client';

import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  label: string;
  calories: number;
}

interface CalorieTrendsChartProps {
  daily: DataPoint[];
  weekly: DataPoint[];
  monthly: DataPoint[];
}

type Mode = 'daily' | 'weekly' | 'monthly';

export const CalorieTrendsChart: React.FC<CalorieTrendsChartProps> = ({
  daily,
  weekly,
  monthly,
}) => {
  const [mode, setMode] = useState<Mode>('daily');
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');

  const getActiveData = (): DataPoint[] => {
    switch (mode) {
      case 'daily':
        return daily;
      case 'weekly':
        return weekly;
      case 'monthly':
        return monthly;
    }
  };

  const activeData = getActiveData();

  const data: ChartData<'line' | 'bar'> = {
    labels: activeData.map((d) => d.label),
    datasets: [
      {
        label: 'แคลอรี (kcal)',
        data: activeData.map((d) => d.calories),
        backgroundColor: 'rgba(16, 185, 129, 0.25)', // emerald-500 transparent
        borderColor: '#10b981', // emerald-500
        borderWidth: 2,
        borderRadius: 6,
        tension: 0.3, // smooth curves
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b', // slate-800
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return ` ${context.parsed.y} kcal`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9', // slate-100
        },
        ticks: {
          color: '#64748b', // slate-500
          font: { size: 10, weight: 'bold' },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 10, weight: 'bold' },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-800 text-md tracking-tight">แนวโน้มแคลอรี</h3>
          <p className="text-xs text-slate-400 font-semibold">ติดตามประวัติการรับประทานแคลอรี่ย้อนหลัง</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-bold text-slate-600">
            {(['daily', 'weekly', 'monthly'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === m
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                {m === 'daily' ? 'รายวัน' : m === 'weekly' ? 'รายสัปดาห์' : 'รายเดือน'}
              </button>
            ))}
          </div>

          {/* Chart type switch */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              กราฟแท่ง
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartType === 'line' ? 'bg-white text-emerald-600 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              กราฟเส้น
            </button>
          </div>
        </div>
      </div>

      <div className="h-64 relative w-full">
        {chartType === 'bar' ? (
          <Bar data={data as unknown as ChartData<'bar'>} options={options as unknown as ChartOptions<'bar'>} />
        ) : (
          <Line data={data as unknown as ChartData<'line'>} options={options as unknown as ChartOptions<'line'>} />
        )}
      </div>
    </div>
  );
};
export default CalorieTrendsChart;
