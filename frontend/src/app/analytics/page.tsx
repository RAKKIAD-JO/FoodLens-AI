'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { Layout } from '../../components/Layout';
import { CalorieTrendsChart } from '../../components/CalorieTrendsChart';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ChartDataResponse {
  daily: { label: string; calories: number }[];
  weekly: { label: string; calories: number }[];
  monthly: { label: string; calories: number }[];
  macros: { protein: number; carbohydrates: number; fat: number };
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<ChartDataResponse>({
    queryKey: ['dashboardCharts'],
    queryFn: async () => {
      const res = await apiFetch('/dashboard/charts');
      return res.data;
    },
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">สถิติและวิเคราะห์โภชนาการ</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            เจาะลึกความผันผวนของแคลอรีและการแบ่งสัดส่วนสารอาหารหลักในแต่ละวัน สัปดาห์ และเดือน
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-80 bg-white border border-slate-100 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-48 bg-white border border-slate-100 rounded-2xl"></div>
              <div className="h-48 bg-white border border-slate-100 rounded-2xl"></div>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Top Chart component */}
            <CalorieTrendsChart
              daily={data.daily}
              weekly={data.weekly}
              monthly={data.monthly}
            />

            {/* Bottom aggregate review grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Macro breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-black text-slate-800 text-md tracking-tight">ยอดรวมสารอาหารหลัก (7 วันที่ผ่านมา)</h3>
                  <p className="text-xs text-slate-400 font-semibold">ผลรวมน้ำหนักกรัมของสารอาหารหลักที่บริโภคทั้งหมด</p>
                </div>

                <div className="space-y-4">
                  {/* Protein */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 font-bold">โปรตีน</span>
                      <span className="text-slate-800 font-black">{data.macros.protein} g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (data.macros.protein / 700) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 font-bold">คาร์โบไฮเดรต</span>
                      <span className="text-slate-800 font-black">{data.macros.carbohydrates} g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (data.macros.carbohydrates / 2100) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Fat */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 font-bold">ไขมัน</span>
                      <span className="text-slate-800 font-black">{data.macros.fat} g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (data.macros.fat / 600) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Highlights card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-800 text-md tracking-tight">สรุปยอดรวมสารอาหารหลัก</h3>
                  <p className="text-xs text-slate-400 font-semibold">การประเมินสถิติยอดรวมรายสัปดาห์</p>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-emerald-50/50 border-emerald-100 flex gap-4 items-center">
                  <div className="bg-emerald-500 text-white p-3 rounded-xl shrink-0">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">พลังงานที่ได้รับในสัปดาห์นี้ทั้งหมด</h5>
                    <p className="text-xl font-black text-emerald-700">
                      {Math.round(data.daily.reduce((sum, item) => sum + item.calories, 0))} kcal
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      เฉลี่ยวันละ {Math.round(data.daily.reduce((sum, item) => sum + item.calories, 0) / 7)} kcal
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  การบันทึกแคลอรีอย่างสม่ำเสมอช่วยให้ AI แนะนำขนาดส่วนผสมและคาดการณ์การลดน้ำหนักได้อย่างแม่นยำยิ่งขึ้น
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>ไม่สามารถโหลดข้อมูลสถิติแผนภูมิวิเคราะห์ได้ กรุณาตรวจสอบการเชื่อมต่อกับระบบหลังบ้าน</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
