'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getFullImageUrl } from '../../lib/api';
import { Layout } from '../../components/Layout';
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass
} from 'lucide-react';
import Link from 'next/link';

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

interface HistoryResponse {
  records: FoodRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query history
  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: ['foodHistory', search, startDate, endDate, page],
    queryFn: async () => {
      let queryParams = `?page=${page}&limit=${limit}`;
      if (search) queryParams += `&search=${encodeURIComponent(search)}`;
      if (startDate) queryParams += `&startDate=${startDate}`;
      if (endDate) queryParams += `&endDate=${endDate}`;
      
      const res = await apiFetch(`/foods/history${queryParams}`);
      return res.data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/foods/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodHistory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['recentMeals'] });
    },
    onError: (err) => {
      alert(err.message || 'ลบรายการไม่สำเร็จ');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการอาหาร "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ประวัติการบันทึกอาหาร</h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              ค้นหาและจัดการประวัติการบันทึกข้อมูลโภชนาการของคุณ
            </p>
          </div>
          <Link
            href="/upload"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> บันทึกมื้ออาหาร
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ค้นหาเมนูอาหาร</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ค้นหาอาหารด้วยชื่อ..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-semibold text-slate-700"
            />
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all sm:col-start-4"
          >
            ล้างตัวกรอง
          </button>
        </div>

        {/* Results List */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : !data || data.records.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="bg-slate-50 text-slate-400 p-4 rounded-full">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-md font-bold text-slate-800">ไม่พบรายการข้อมูล</h3>
            <p className="text-xs text-slate-400 max-w-sm font-semibold">
              ไม่มีประวัติการบันทึกอาหารที่ตรงกับตัวกรองของคุณ ลองล้างข้อมูลหรือบันทึกอาหารมื้อใหม่
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">รายการอาหาร</th>
                    <th className="px-6 py-4">วันที่บันทึก</th>
                    <th className="px-6 py-4 text-right">แคลอรี</th>
                    <th className="px-6 py-4 text-right">สารอาหาร (โปรตีน/คาร์บ/ไขมัน)</th>
                    <th className="px-6 py-4 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {data.records.map((meal) => {
                    const recordDate = new Date(meal.createdAt);
                    return (
                      <tr key={meal.id} className="group hover:bg-slate-50/50 transition-all">
                        {/* Food plate */}
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                            {meal.imageUrl && meal.imageUrl !== '/placeholder-food.jpg' ? (
                              <img src={getFullImageUrl(meal.imageUrl)} alt={meal.foodName} className="object-cover h-full w-full" />
                            ) : (
                              <Compass className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{meal.foodName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{meal.estimatedWeight}g น้ำหนักโดยประมาณ</p>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          {recordDate.toLocaleDateString('th-TH', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          เวลา{' '}
                          {recordDate.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </td>

                        {/* Calories */}
                        <td className="px-6 py-4 text-right font-black text-slate-800">
                          {Math.round(meal.calories)} kcal
                        </td>

                        {/* Macros */}
                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{Math.round(meal.protein)}g โปรตีน</span>
                          <span className="ml-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{Math.round(meal.carbohydrates)}g คาร์บ</span>
                          <span className="ml-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{Math.round(meal.fat)}g ไขมัน</span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(meal.id, meal.foodName)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all inline-flex items-center justify-center"
                            title="ลบรายการอาหาร"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                จำนวนบันทึกทั้งหมด: {data.total}
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-slate-600">
                  หน้า {page} จาก {data.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
