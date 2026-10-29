import React, { useState } from 'react';
import { X, Smartphone, Layers, Code2, Sparkles, Check } from 'lucide-react';
import { UIType } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, packageName: string, uiType: UIType, minSdk: number) => void;
  lang: 'ar' | 'en';
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [name, setName] = useState('Android Studio Mobile App');
  const [packageName, setPackageName] = useState('com.my.androidstudio');
  const [uiType, setUiType] = useState<UIType>('compose');
  const [minSdk, setMinSdk] = useState(26);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !packageName.trim()) return;
    onCreate(name.trim(), packageName.trim(), uiType, minSdk);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 select-none animate-fade-in">
      <div className="bg-[#1e1f22] border border-[#393b40] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-12 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#3ddc84] text-black font-bold flex items-center justify-center text-xs">
              🤖
            </div>
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'إنشاء مشروع أندرويد جديد (New Project)' : 'New Android Project'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9da0a8] hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {/* Template Choice */}
          <div className="space-y-1.5">
            <label className="font-semibold text-[#dfe1e5] block">
              {isAr ? 'قالب المشروع (Project Template):' : 'Project Template:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => setUiType('compose')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  uiType === 'compose'
                    ? 'bg-[#3ddc84]/15 border-[#3ddc84] text-white shadow-sm'
                    : 'bg-[#26282b] border-[#393b40] text-[#9da0a8] hover:border-[#4e5157]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">Jetpack Compose</span>
                  {uiType === 'compose' && <Check className="w-4 h-4 text-[#3ddc84]" />}
                </div>
                <p className="text-[10px] leading-relaxed">
                  {isAr ? 'واجهات برمجية حديثة بالكامل بلغة Kotlin و Material 3' : 'Modern declarative UI with Material 3'}
                </p>
              </div>

              <div
                onClick={() => setUiType('xml')}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  uiType === 'xml'
                    ? 'bg-[#3ddc84]/15 border-[#3ddc84] text-white shadow-sm'
                    : 'bg-[#26282b] border-[#393b40] text-[#9da0a8] hover:border-[#4e5157]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">XML Views Layout</span>
                  {uiType === 'xml' && <Check className="w-4 h-4 text-[#3ddc84]" />}
                </div>
                <p className="text-[10px] leading-relaxed">
                  {isAr ? 'واجهات أندرويد التقليدية باستخدام ملفات XML التخطيطية' : 'Traditional Android Views & Layouts'}
                </p>
              </div>
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-1">
            <label className="font-semibold text-[#dfe1e5]">
              {isAr ? 'اسم التطبيق (Name):' : 'Application Name:'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-medium"
            />
          </div>

          {/* Package Name */}
          <div className="space-y-1">
            <label className="font-semibold text-[#dfe1e5]">
              {isAr ? 'اسم الحزمة (Package Name):' : 'Package Name:'}
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
            />
          </div>

          {/* Minimum SDK */}
          <div className="space-y-1">
            <label className="font-semibold text-[#dfe1e5]">
              {isAr ? 'الحد الأدنى لنظام أندرويد (Minimum SDK):' : 'Minimum SDK:'}
            </label>
            <select
              value={minSdk}
              onChange={(e) => setMinSdk(Number(e.target.value))}
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84]"
            >
              <option value={26}>API 26: Android 8.0 (Oreo) - يدعم 97% من الأجهزة</option>
              <option value={29}>API 29: Android 10</option>
              <option value={33}>API 33: Android 13 (Tiramisu)</option>
              <option value={34}>API 34: Android 14</option>
            </select>
          </div>

          {/* Language Info */}
          <div className="p-2.5 bg-[#26282b] border border-[#393b40] rounded-xl flex items-center justify-between text-[11px]">
            <span className="text-[#9da0a8]">{isAr ? 'لغة البرمجة:' : 'Language:'}</span>
            <span className="font-bold text-purple-400 font-mono">Kotlin (JVM 17)</span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#9da0a8] hover:text-white rounded-lg transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold rounded-lg transition shadow-md"
            >
              {isAr ? 'إنشاء وبدء المشروع' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
