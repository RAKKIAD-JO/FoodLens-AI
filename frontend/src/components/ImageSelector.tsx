'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';

interface ImageSelectorProps {
  onImageSelected: (file: File) => void;
  onClear: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelected, onClear }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดรูปภาพประเภท JPG, JPEG, PNG หรือ WEBP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ขนาดรูปภาพเกินขีดจำกัด 10MB');
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    onImageSelected(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onClear();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraSelect = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex flex-col items-center justify-center p-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden max-h-[300px] border border-slate-200 shadow-sm flex items-center justify-center bg-black">
            <img
              src={previewUrl}
              alt="Selected food item preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <button
            onClick={handleClear}
            className="absolute top-6 right-6 p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg transition-all"
            title="ลบรูปภาพ"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <ImageIcon className="h-4 w-4 text-emerald-500" />
            <span>เลือกรูปภาพสำเร็จแล้ว ดำเนินการวิเคราะห์ด้วย AI ต่อไป</span>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          {/* File inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            className="hidden"
            accept="image/jpeg, image/jpg, image/png, image/webp"
          />
          {/* Camera capture input */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleChange}
            className="hidden"
            accept="image/*"
            capture="environment"
          />

          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-4">
            <Upload className="h-8 w-8" />
          </div>

          <p className="text-sm font-bold text-slate-700 text-center mb-1">
            ลากและวางรูปภาพอาหารของคุณที่นี่
          </p>
          <p className="text-xs text-slate-400 font-semibold text-center mb-6">
            รองรับ JPEG, JPG, PNG, WEBP (สูงสุด 10MB)
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={triggerFileSelect}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-sm transition-all"
            >
              เลือกไฟล์
            </button>
            <button
              onClick={triggerCameraSelect}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 shadow-sm shadow-emerald-150 transition-all animate-pulse"
            >
              <Camera className="h-4 w-4" />
              เปิดกล้อง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ImageSelector;
