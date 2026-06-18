'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { ImageSelector } from '../../components/ImageSelector';
import { apiFetch, getFullImageUrl } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface FoodAnalysis {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  estimatedWeight: number;
  confidence: number;
  imageUrl: string;
}

interface Alternative {
  food_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  benefits: string;
  nutrition_comparison: string;
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysis | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[] | null>(null);

  const steps = [
    'กำลังส่งรูปภาพไปยังเซิร์ฟเวอร์...',
    'กำลังเรียกใช้งานโมเดล Google Gemini Vision...',
    'กำลังตรวจสอบส่วนผสมและระบุชื่ออาหาร...',
    'กำลังประมาณการน้ำหนักและขนาดจาน...',
    'กำลังสรุปผลการคำนวณข้อมูลโภชนาการ...'
  ];

  // Loading animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loadingStep > 0 && loadingStep < steps.length - 1) {
      interval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, steps.length - 1));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loadingStep, steps.length]);

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      setLoadingStep(1);
      const res = await apiFetch('/foods/analyze', {
        method: 'POST',
        bodyData: formData,
      });
      return res.data as FoodAnalysis;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setLoadingStep(0);
    },
    onError: (err: unknown) => {
      console.error(err);
      setLoadingStep(0);
      const msg = err instanceof Error ? err.message : 'การวิเคราะห์รูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง';
      alert(msg);
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult) return null;
      const res = await apiFetch('/recommendations/healthy-food', {
        method: 'POST',
        bodyData: {
          foodName: analysisResult.foodName,
          calories: analysisResult.calories,
        },
      });
      return res.data as Alternative[];
    },
    onSuccess: (data) => {
      setAlternatives(data);
    },
    onError: (err: unknown) => {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลอาหารแนะนำทางเลือกสุขภาพได้';
      alert(msg);
    },
  });

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setAlternatives(null);
    setLoadingStep(0);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeMutation.mutate(selectedFile);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">วิเคราะห์อาหารด้วย AI</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            ถ่ายภาพหรืออัปโหลดรูปภาพอาหารของคุณเพื่อคำนวณน้ำหนักประเมินสัดส่วนและสารอาหารหลักได้ในทันที
          </p>
        </div>

        {/* Loading overlay */}
        {loadingStep > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center gap-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
            <div className="space-y-2">
              <h3 className="font-black text-slate-800 text-lg">AI กำลังวิเคราะห์รูปภาพอาหาร...</h3>
              <p className="text-xs text-slate-500 font-bold max-w-sm animate-pulse">
                {steps[loadingStep - 1]}
              </p>
            </div>
          </div>
        )}

        {/* Upload flow */}
        {loadingStep === 0 && !analysisResult && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 text-md">ขั้นตอนที่ 1: อัปโหลดรูปภาพอาหาร</h3>
            <ImageSelector onImageSelected={handleImageSelected} onClear={handleClear} />

            {selectedFile && (
              <button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4.5 w-4.5" />
                วิเคราะห์ด้วยระบบ Gemini AI
              </button>
            )}
          </div>
        )}

        {/* Results layout */}
        {loadingStep === 0 && analysisResult && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Image box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col items-center">
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-100 flex items-center justify-center">
                  <img
                    src={getFullImageUrl(analysisResult.imageUrl)}
                    alt={analysisResult.foodName}
                    className="max-h-[300px] max-w-full object-contain"
                  />
                </div>
                <button
                  onClick={handleClear}
                  className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 py-2 w-full border border-slate-200 rounded-xl transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> บันทึกจานอาหารอื่น
                </button>
              </div>

              {/* Analysis details */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100 uppercase tracking-wider">
                      ความมั่นใจ: {analysisResult.confidence}%
                    </span>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-2">{analysisResult.foodName}</h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">น้ำหนักโดยประมาณ: {analysisResult.estimatedWeight}g</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-800">{Math.round(analysisResult.calories)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">แคลอรีทั้งหมด</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">สัดส่วนสารอาหารหลัก</h4>
                  
                  {/* Protein progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">โปรตีน</span>
                      <span className="text-slate-800 font-bold">{Math.round(analysisResult.protein)}g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.protein / 50) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Carbs progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">คาร์โบไฮเดรต</span>
                      <span className="text-slate-800 font-bold">{Math.round(analysisResult.carbohydrates)}g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.carbohydrates / 100) * 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Fat progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">ไขมัน</span>
                      <span className="text-slate-800 font-bold">{Math.round(analysisResult.fat)}g</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (analysisResult.fat / 40) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                {!alternatives && (
                  <button
                    onClick={() => recommendationMutation.mutate()}
                    disabled={recommendationMutation.isPending}
                    className="w-full mt-4 py-3 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {recommendationMutation.isPending ? 'กำลังเรียกใช้ระบบ Gemini...' : 'แนะนำอาหารทางเลือกสุขภาพ'}
                  </button>
                )}
              </div>
            </div>

            {/* Alternatives section */}
            {alternatives && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">อาหารทางเลือกเพื่อสุขภาพโดย AI</h3>
                  <p className="text-xs text-slate-400 font-semibold">คำแนะนำเมนูทดแทนเพื่อปรับปรุงคุณภาพโภชนาการของคุณ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100">
                          ทางเลือกที่ {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-md">{alt.food_name}</h4>
                        <p className="text-xs text-emerald-600 font-bold">{alt.calories} kcal</p>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">{alt.benefits}</p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-3 space-y-2">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-[10px] text-indigo-700 font-bold">
                          {alt.nutrition_comparison}
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>P: {alt.protein}g</span>
                          <span>C: {alt.carbohydrates}g</span>
                          <span>F: {alt.fat}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
