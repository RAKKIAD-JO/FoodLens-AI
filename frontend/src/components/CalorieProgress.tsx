'use client';

import React from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface CalorieProgressProps {
  tdee: number;
  consumed: number;
  remaining: number;
  progress: number;
  profileSet: boolean;
}

export const CalorieProgress: React.FC<CalorieProgressProps> = ({
  tdee,
  consumed,
  remaining,
  progress,
  profileSet,
}) => {
  // Circular Progress calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
      {/* Decorative top-right accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-70"></div>

      <div className="flex-1 space-y-4 text-center md:text-left">
        <div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            {"แคลอรีแนะนำวันนี้"}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ตัวติดตามแคลอรี</h2>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">เป้าหมาย (TDEE)</p>
            <p className="text-lg font-black text-slate-700">{tdee} <span className="text-xs font-semibold text-slate-500">kcal</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ทานแล้ว</p>
            <p className="text-lg font-black text-emerald-600">{consumed} <span className="text-xs font-semibold text-emerald-500">kcal</span></p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">คงเหลือ</p>
            <p className="text-lg font-black text-indigo-600">{remaining} <span className="text-xs font-semibold text-indigo-500">kcal</span></p>
          </div>
        </div>

        {!profileSet && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              ข้อมูลโปรไฟล์ของคุณยังไม่สมบูรณ์ <strong>ตั้งค่าโปรไฟล์ของคุณ</strong> เพื่อคำนวณเป้าหมาย TDEE ส่วนบุคคล
            </span>
          </div>
        )}
      </div>

      {/* Circle Progress Indicator */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-44 h-44 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="text-slate-100"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Foreground circle */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="text-emerald-500 transition-all duration-500 ease-out"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-3xl font-black text-slate-800 tracking-tight">{progress}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ของเป้าหมายต่อวัน</p>
        </div>
      </div>
    </div>
  );
};
export default CalorieProgress;
