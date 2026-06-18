'use client';

import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { ImageSelector } from '../../components/ImageSelector';
import { apiFetch, getFullImageUrl } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ScanResult {
  id: string;
  imageUrl: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  sugar: number;
  fat: number;
  sodium: number;
  createdAt: string;
}

export default function ScannerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const scanMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      setLoading(true);
      const res = await apiFetch('/nutrition/scan', {
        method: 'POST',
        bodyData: formData,
      });
      return res.data as ScanResult;
    },
    onSuccess: (data) => {
      setScanResult(data);
      setLoading(false);
    },
    onError: (err: unknown) => {
      console.error(err);
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'การสแกนฉลากโภชนาการล้มเหลว';
      alert(msg);
    },
  });

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setScanResult(null);
    setLoading(false);
  };

  const handleScan = () => {
    if (selectedFile) {
      scanMutation.mutate(selectedFile);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">สแกนฉลากโภชนาการ</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            สแกนส่วนผสมและตารางข้อมูลโภชนาการบนบรรจุภัณฑ์อาหารเพื่อดึงข้อมูลน้ำตาล ไขมัน โปรตีน และโซเดียมได้ในทันที
          </p>
        </div>

        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center gap-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 text-lg">AI กำลังอ่านข้อมูลฉลาก...</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm animate-pulse">
                กำลังวิเคราะห์บล็อกข้อความ ค้นหาตัวเลข และตรวจสอบสารอาหารหลัก...
              </p>
            </div>
          </div>
        )}

        {!loading && !scanResult && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 text-md">อัปโหลดฉลากโภชนาการ</h3>
            <ImageSelector onImageSelected={handleImageSelected} onClear={handleClear} />

            {selectedFile && (
              <button
                onClick={handleScan}
                disabled={scanMutation.isPending}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4.5 w-4.5" />
                สแกนฉลากด้วยระบบ Gemini
              </button>
            )}
          </div>
        )}

        {!loading && scanResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Box: Image Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
              <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-100 flex items-center justify-center">
                <img
                  src={getFullImageUrl(scanResult.imageUrl)}
                  alt="Scanned nutrition label"
                  className="max-h-[300px] max-w-full object-contain"
                />
              </div>
              <button
                onClick={handleClear}
                className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 py-2 w-full border border-slate-200 rounded-xl transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" /> สแกนบรรจุภัณฑ์อื่น
              </button>
            </div>

            {/* Right Box: Nutrition Facts Styled UI */}
            <div className="bg-white border border-slate-350 p-6 max-w-sm mx-auto w-full shadow-sm text-slate-900 font-sans border-2">
              <h2 className="text-3xl font-black leading-none border-b-8 border-slate-950 pb-2">ข้อมูลโภชนาการ</h2>
              
              <div className="text-xs font-bold py-1.5 border-b border-slate-200">
                คุณค่าทางโภชนาการต่อหนึ่งหน่วยบริโภค
              </div>
              
              <div className="flex justify-between items-end border-b-8 border-slate-950 py-1">
                <span className="text-2xl font-black">แคลอรีทั้งหมด</span>
                <span className="text-3xl font-black leading-none">{scanResult.calories}</span>
              </div>

              <div className="text-right text-[10px] font-bold py-1 border-b border-slate-200">
                % ปริมาณที่แนะนำต่อวัน *
              </div>

              {/* Total Fat */}
              <div className="flex justify-between py-1.5 border-b border-slate-150 text-xs">
                <span>
                  <strong>ไขมันทั้งหมด</strong> {scanResult.fat}g
                </span>
                <strong>{Math.round((scanResult.fat / 65) * 100)}%</strong>
              </div>

              {/* Carbohydrates */}
              <div className="flex justify-between py-1.5 border-b border-slate-150 text-xs">
                <span>
                  <strong>คาร์โบไฮเดรตทั้งหมด</strong> {scanResult.carbohydrates}g
                </span>
                <strong>{Math.round((scanResult.carbohydrates / 300) * 100)}%</strong>
              </div>

              {/* Sugars */}
              <div className="flex justify-between py-1.5 border-b border-slate-150 text-xs pl-4">
                <span className="text-slate-500 font-semibold">น้ำตาลทั้งหมด {scanResult.sugar}g</span>
                <span>-</span>
              </div>

              {/* Protein */}
              <div className="flex justify-between py-1.5 border-b border-slate-150 text-xs">
                <span>
                  <strong>โปรตีน</strong> {scanResult.protein}g
                </span>
                <strong>{Math.round((scanResult.protein / 50) * 100)}%</strong>
              </div>

              {/* Sodium */}
              <div className="flex justify-between py-1.5 border-b-4 border-slate-950 text-xs">
                <span>
                  <strong>โซเดียม</strong> {scanResult.sodium}mg
                </span>
                <strong>{Math.round((scanResult.sodium / 2400) * 100)}%</strong>
              </div>

              <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-2.5">
                * ร้อยละของปริมาณสารอาหารที่แนะนำให้บริโภคต่อวันสำหรับคนไทยตั้งแต่อายุ 6 ปีขึ้นไป (Thai RDI) โดยคิดจากความต้องการพลังงานวันละ 2,000 แคลอรี
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
