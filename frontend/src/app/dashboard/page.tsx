'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, getFullImageUrl } from '../../lib/api';
import { Layout } from '../../components/Layout';
import { CalorieProgress } from '../../components/CalorieProgress';
import { MacronutrientPie } from '../../components/MacronutrientPie';
import Link from 'next/link';
import {
  Plus,
  Compass,
  ChevronRight,
  Heart,
  AlertCircle
} from 'lucide-react';

interface FoodRecord {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  estimatedWeight: number;
  imageUrl: string;
  createdAt: string;
}

export default function Dashboard() {
  // 1. Fetch dashboard summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await apiFetch('/dashboard/summary');
      return res.data;
    },
  });

  // 2. Fetch recent meals (limit 5)
  const { data: recentMeals, isLoading: mealsLoading } = useQuery<{
    records: FoodRecord[];
    total: number;
  }>({
    queryKey: ['recentMeals'],
    queryFn: async () => {
      const res = await apiFetch('/foods/history?limit=5');
      return res.data;
    },
  });

  const loading = summaryLoading || mealsLoading;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">แดชบอร์ดสุขภาพ</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              ติดตามความคืบหน้าของสารอาหารประจำวัน เป้าหมายสุขภาพ และประวัติการรับประทานอาหารล่าสุดแบบเรียลไทม์
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/scanner"
              className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              สแกนฉลากสินค้า
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> บันทึกมื้ออาหาร
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-48 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
            <div className="h-48 bg-white border border-slate-100 rounded-2xl animate-pulse"></div>
          </div>
        ) : summaryData ? (
          <>
            {/* Top Stats: Calorie Ring & Macro Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CalorieProgress
                  tdee={summaryData.tdee}
                  consumed={summaryData.consumed}
                  remaining={summaryData.remaining}
                  progress={summaryData.progress}
                  profileSet={summaryData.profileSet}
                />
              </div>
              <div>
                <MacronutrientPie macros={summaryData.macros} />
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent meals table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 text-md tracking-tight">{"ประวัติการกินวันนี้"}</h3>
                    <p className="text-xs text-slate-400 font-semibold">รายการที่บันทึกล่าสุด</p>
                  </div>
                  <Link
                    href="/history"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition-all"
                  >
                    ดูทั้งหมด
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                {!recentMeals || recentMeals.records.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full">
                      <Plus className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">ยังไม่มีการบันทึกมื้ออาหารในวันนี้</p>
                    <p className="text-xs text-slate-400 max-w-xs font-semibold">
                      ถ่ายภาพอาหารมื้อเช้า มื้อกลางวัน หรือมื้อเย็นของคุณเพื่อวิเคราะห์สารอาหารได้ทันที
                    </p>
                    <Link
                      href="/upload"
                      className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      บันทึกอาหารมื้อแรกของคุณ
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 font-bold">ข้อมูลอาหาร</th>
                          <th className="pb-3 font-bold">เวลา</th>
                          <th className="pb-3 font-bold text-right">แคลอรี</th>
                          <th className="pb-3 font-bold text-right">สารอาหาร (โปรตีน/คาร์บ/ไขมัน)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {recentMeals.records.map((meal) => {
                          const date = new Date(meal.createdAt);
                          const timeString = date.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          });
                          return (
                            <tr key={meal.id} className="group hover:bg-slate-50/50 transition-all">
                              <td className="py-3.5 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                                  {meal.imageUrl && meal.imageUrl !== '/placeholder-food.jpg' ? (
                                    <img src={getFullImageUrl(meal.imageUrl)} alt={meal.foodName} className="object-cover h-full w-full" />
                                  ) : (
                                    <Compass className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800">{meal.foodName}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{meal.estimatedWeight}g น้ำหนักโดยประมาณ</p>
                                </div>
                              </td>
                              <td className="py-3.5 text-xs text-slate-500 font-semibold">
                                {timeString}
                              </td>
                              <td className="py-3.5 text-right font-bold text-slate-800">
                                {Math.round(meal.calories)} kcal
                              </td>
                              <td className="py-3.5 text-right text-xs font-bold text-slate-500">
                                <span className="text-emerald-600">{Math.round(meal.protein)}g</span>
                                <span className="mx-1 text-slate-300">/</span>
                                <span className="text-blue-600">{Math.round(meal.carbohydrates)}g</span>
                                <span className="mx-1 text-slate-300">/</span>
                                <span className="text-amber-600">{Math.round(meal.fat)}g</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Sidebar stats cards */}
              <div className="space-y-6">
                {/* Health profile quick status */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-15%] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                  <h4 className="font-extrabold text-white text-md mb-2 flex items-center gap-2">
                    <Heart className="h-5 w-5" /> โปรไฟล์สุขภาพ
                  </h4>
                  <p className="text-xs text-emerald-100 leading-relaxed mb-6 font-medium">
                    รักษาเป้าหมายน้ำหนักและประเมินค่า TDEE ที่ถูกต้องแม่นยำ โดยคอยอัปเดตน้ำหนักและระดับกิจกรรมของคุณให้เป็นปัจจุบัน
                  </p>
                  <Link
                    href="/profile"
                    className="w-full text-center block bg-white text-emerald-700 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 shadow-sm transition-all"
                  >
                    ปรับแต่งโปรไฟล์
                  </Link>
                </div>

                {/* Dashboard tips */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">เคล็ดลับอัจฉริยะ</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3 text-xs">
                      <div className="bg-emerald-50 text-emerald-600 p-1.5 h-7 w-7 rounded-lg shrink-0 flex items-center justify-center font-bold">
                        1
                      </div>
                      <p className="text-slate-500 font-semibold leading-relaxed">
                        บันทึกมื้ออาหารทันทีหลังรับประทานเพื่อให้กราฟสถิติติดตามผลมีความแม่นยำสูงสุด
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <div className="bg-blue-50 text-blue-600 p-1.5 h-7 w-7 rounded-lg shrink-0 flex items-center justify-center font-bold">
                        2
                      </div>
                      <p className="text-slate-500 font-semibold leading-relaxed">
                        เปรียบเทียบสัดส่วนคาร์โบไฮเดรตและไขมันของคุณที่แท็บเมนู **สถิติและแนวโน้ม**
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>ไม่สามารถโหลดข้อมูลสถิติแดชบอร์ดได้ กรุณาตรวจสอบการเชื่อมต่อกับระบบหลังบ้าน</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
