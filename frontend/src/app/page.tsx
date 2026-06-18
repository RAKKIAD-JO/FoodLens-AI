'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Apple, Camera, Activity, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Apple className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">FoodLens AI</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              แดชบอร์ด
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
              >
                เริ่มต้นใช้งาน
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto w-full px-6 text-center py-16 z-10 flex-1 flex flex-col items-center justify-center gap-8">
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-2">
          <Activity className="h-4 w-4" /> ขับเคลื่อนด้วย Google Gemini 1.5 Flash Vision
        </span>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
          ถ่ายรูป. วิเคราะห์. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            ติดตามโภชนาการของคุณ.
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-md max-w-xl mx-auto leading-relaxed">
          เครื่องมือคำนวณแคลอรีอัจฉริยะขั้นสุดยอด เพียงถ่ายภาพอาหารในจานของคุณเพื่อประเมินขนาดจาน ปริมาณแคลอรี และสารอาหารหลัก (มาโคร) โดยอัตโนมัติ พร้อมเปรียบเทียบกับเป้าหมายสุขภาพของคุณ
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm mt-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              ไปที่แดชบอร์ด
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" /> เริ่มสแกนรูปภาพ
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                เข้าสู่ระบบ
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 max-w-3xl">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-left relative overflow-hidden backdrop-blur-md">
            <h3 className="font-bold text-md text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ระบบวิเคราะห์อาหารด้วย AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ระบุเมนูอาหารที่ซับซ้อน ประเมินขนาดส่วนผสม และคำนวณน้ำหนักเป็นกรัมได้ทันที
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-left relative overflow-hidden backdrop-blur-md">
            <h3 className="font-bold text-md text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              เป้าหมาย TDEE & แคลอรี
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              กำหนดเป้าหมายของคุณ (ลดน้ำหนัก, เพิ่มน้ำหนัก, หรือรักษาน้ำหนัก) และติดตามความคืบหน้าแบบเรียลไทม์
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-left relative overflow-hidden backdrop-blur-md">
            <h3 className="font-bold text-md text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ระบบสแกนฉลากสินค้า
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              สแกนฉลากข้อมูลโภชนาการของอาหารแปรรูปหรือเครื่องดื่มเพื่อดึงข้อมูลน้ำตาล โซเดียม โปรตีน และไขมันได้ง่ายดาย
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center border-t border-slate-900 z-10 shrink-0">
        <p className="text-xs text-slate-600 font-semibold">
          &copy; {new Date().getFullYear()} FoodLens AI. สงวนลิขสิทธิ์ทั้งหมด
        </p>
      </footer>
    </div>
  );
}
