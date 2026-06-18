'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { Layout } from '../../components/Layout';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<string>('male');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<string>('sedentary');
  const [goal, setGoal] = useState<string>('maintain');

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(user.age || '');
      setGender(user.gender || 'male');
      setWeight(user.weight || '');
      setHeight(user.height || '');
      setActivityLevel(user.activityLevel || 'sedentary');
      setGoal(user.goal || 'maintain');
    }
  }, [user]);

  // Dynamic metrics calculation
  const [metrics, setMetrics] = useState<{
    bmi: number | null;
    bmr: number | null;
    tdee: number | null;
    target: number | null;
  }>({ bmi: null, bmr: null, tdee: null, target: null });

  useEffect(() => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);

    if (!w || !h || !a || !gender) {
      setMetrics({ bmi: null, bmr: null, tdee: null, target: null });
      return;
    }

    // BMI
    const hM = h / 100;
    const bmi = parseFloat((w / (hM * hM)).toFixed(1));

    // BMR (Mifflin-St Jeor)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else if (gender === 'female') {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 78;
    }
    bmr = Math.round(bmr);

    // TDEE
    let mult = 1.2;
    if (activityLevel === 'light') mult = 1.375;
    else if (activityLevel === 'moderate') mult = 1.55;
    else if (activityLevel === 'active') mult = 1.725;
    else if (activityLevel === 'very_active') mult = 1.9;
    
    const tdee = Math.round(bmr * mult);

    // Target Calories
    let target = tdee;
    if (goal === 'weight_loss') target = Math.max(1200, tdee - 500);
    else if (goal === 'weight_gain') target = tdee + 500;

    setMetrics({ bmi, bmr, tdee, target });
  }, [weight, height, age, gender, activityLevel, goal]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name,
        age: age ? Number(age) : null,
        gender: gender || null,
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        activityLevel: activityLevel || null,
        goal: goal || null,
      };

      const res = await apiFetch('/users/profile', {
        method: 'PUT',
        bodyData: body,
      });
      return res;
    },
    onSuccess: async () => {
      setSuccess('บันทึกข้อมูลและคำนวณโปรไฟล์สุขภาพใหม่สำเร็จแล้ว');
      setError(null);
      await refreshProfile();
      setTimeout(() => setSuccess(null), 4000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'บันทึกข้อมูลโปรไฟล์สุขภาพล้มเหลว';
      setError(msg);
      setSuccess(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: 'น้ำหนักน้อยกว่าเกณฑ์', color: 'text-blue-500 bg-blue-50 border-blue-200' };
    if (bmiValue < 25) return { label: 'น้ำหนักปกติ', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' };
    if (bmiValue < 30) return { label: 'น้ำหนักเกินเกณฑ์', color: 'text-amber-500 bg-amber-50 border-amber-200' };
    return { label: 'โรคอ้วน', color: 'text-red-500 bg-red-50 border-red-200' };
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ตั้งค่าโปรไฟล์สุขภาพ</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            อัปเดตข้อมูลร่างกายเพื่อประเมินปริมาณแคลอรีที่แนะนำและติดตามค่า BMI แบบเรียลไทม์
          </p>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Form Card */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 text-md border-b border-slate-100 pb-3">ข้อมูลร่างกายส่วนบุคคล</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ชื่อที่แสดง</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">อายุ (ปี)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  placeholder="e.g. 28"
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ส่วนสูง (ซม.)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                    placeholder="เช่น 175"
                    min="50"
                    max="250"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">น้ำหนัก (กก.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                    placeholder="เช่น 70"
                    min="20"
                    max="300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ระดับกิจกรรม</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="sedentary">ไม่ได้ออกกำลังกายเลย (ทำงานนั่งโต๊ะ)</option>
                  <option value="light">ออกกำลังกายเบาๆ (1-3 วัน/สัปดาห์)</option>
                  <option value="moderate">ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)</option>
                  <option value="active">ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)</option>
                  <option value="very_active">ออกกำลังกายหนักมาก (นักกีฬา/ใช้แรงงานหนัก)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">เป้าหมายที่ต้องการ</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                >
                  <option value="weight_loss">ลดน้ำหนัก (-500 kcal)</option>
                  <option value="maintain">รักษาน้ำหนัก</option>
                  <option value="weight_gain">เพิ่มน้ำหนัก (+500 kcal)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updateMutation.isPending ? 'กำลังบันทึกข้อมูล...' : 'บันทึกโปรไฟล์สุขภาพ'}
            </button>
          </form>

          {/* Calculator Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="font-black text-slate-800 text-md border-b border-slate-100 pb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-emerald-500" />
                ตัวคำนวณดัชนีสุขภาพ
              </h3>

              {metrics.bmi === null ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  กรอกข้อมูลส่วนสูง น้ำหนัก และอายุ เพื่อคำนวณและแสดงผลค่า BMR, TDEE และ BMI
                </div>
              ) : (
                <div className="space-y-5">
                  {/* BMI */}
                  <div className="border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ดัชนีมวลกาย (BMI)</p>
                      <p className="text-xl font-black text-slate-800">{metrics.bmi}</p>
                    </div>
                    {metrics.bmi && (
                      <span className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg ${getBMICategory(metrics.bmi).color}`}>
                        {getBMICategory(metrics.bmi).label}
                      </span>
                    )}
                  </div>

                  {/* BMR */}
                  <div className="border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">อัตราการเผาผลาญพื้นฐาน (BMR)</p>
                    <p className="text-xl font-black text-slate-800">{metrics.bmr} <span className="text-xs font-semibold text-slate-400">kcal/วัน</span></p>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      พลังงานที่ร่างกายต้องการขณะพักผ่อน คำนวณตามสูตร Mifflin-St Jeor
                    </p>
                  </div>

                  {/* TDEE */}
                  <div className="border border-slate-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ค่าพลังงานรวมที่ใช้ต่อวัน (TDEE)</p>
                    <p className="text-xl font-black text-emerald-600">{metrics.tdee} <span className="text-xs font-semibold text-emerald-400">kcal/วัน</span></p>
                  </div>

                  {/* Calories Target */}
                  <div className="border border-slate-100 rounded-xl p-3 bg-indigo-50/50 border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">เป้าหมายแคลอรีที่แนะนำ</p>
                    <p className="text-xl font-black text-indigo-700">{metrics.target} <span className="text-xs font-semibold text-indigo-400">kcal/วัน</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
