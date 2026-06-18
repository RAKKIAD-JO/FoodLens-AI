'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Macros {
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface MacronutrientPieProps {
  macros: Macros;
}

export const MacronutrientPie: React.FC<MacronutrientPieProps> = ({ macros }) => {
  const { protein, carbohydrates, fat } = macros;
  const total = protein + carbohydrates + fat || 1; // avoid division by zero

  const proteinPct = Math.round((protein / total) * 100);
  const carbsPct = Math.round((carbohydrates / total) * 100);
  const fatPct = Math.round((fat / total) * 100);

  const data: ChartData<'doughnut'> = {
    labels: ['โปรตีน', 'คาร์โบไฮเดรต', 'ไขมัน'],
    datasets: [
      {
        data: [protein, carbohydrates, fat],
        backgroundColor: [
          '#10b981', // emerald 500
          '#3b82f6', // blue 500
          '#f59e0b', // amber 500
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw as number;
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${val}g (${pct}%)`;
          },
        },
      },
    },
    cutout: '75%',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-6 shadow-sm">
      <div>
        <h3 className="font-black text-slate-800 text-md tracking-tight">สัดส่วนสารอาหารหลัก</h3>
        <p className="text-xs text-slate-400 font-semibold">{"ปริมาณกรัมและเปอร์เซ็นต์ของวันนี้"}</p>
      </div>

      <div className="flex flex-row items-center gap-6 justify-center">
        <div className="relative w-32 h-32 shrink-0">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">มาโคร</span>
            <span className="text-lg font-black text-slate-700">{Math.round(total)}g</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {/* Protein */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-slate-500">โปรตีน</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{protein}g</p>
              <p className="text-[10px] font-bold text-slate-400">{proteinPct}%</p>
            </div>
          </div>

          {/* Carbs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs font-semibold text-slate-500">คาร์โบไฮเดรต</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{carbohydrates}g</p>
              <p className="text-[10px] font-bold text-slate-400">{carbsPct}%</p>
            </div>
          </div>

          {/* Fat */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-xs font-semibold text-slate-500">ไขมัน</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{fat}g</p>
              <p className="text-[10px] font-bold text-slate-400">{fatPct}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MacronutrientPie;
