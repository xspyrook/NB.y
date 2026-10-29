import React, { useState } from 'react';
import { X, Settings, Shield, Sliders, RefreshCw, Save } from 'lucide-react';
import { AndroidProject } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AndroidProject;
  onSaveSettings: (updated: Partial<AndroidProject>) => void;
  lang: 'ar' | 'en';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveSettings,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [name, setName] = useState(project.name);
  const [packageName, setPackageName] = useState(project.packageName);
  const [minSdk, setMinSdk] = useState(project.minSdk);
  const [targetSdk, setTargetSdk] = useState(project.targetSdk);
  const [versionName, setVersionName] = useState(project.versionName);
  const [versionCode, setVersionCode] = useState(project.versionCode);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      name,
      packageName,
      minSdk,
      targetSdk,
      versionName,
      versionCode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 select-none animate-fade-in">
      <div className="bg-[#1e1f22] border border-[#393b40] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-12 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#3ddc84]" />
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'إعدادات المشروع والبناء' : 'Project & Build Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9da0a8] hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#dfe1e5]">
              {isAr ? 'اسم التطبيق (App Name):' : 'Application Name:'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#dfe1e5]">
              {isAr ? 'اسم الحزمة (Package Name):' : 'Package Name:'}
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#dfe1e5]">Min SDK:</label>
              <input
                type="number"
                value={minSdk}
                onChange={(e) => setMinSdk(Number(e.target.value))}
                className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#dfe1e5]">Target SDK:</label>
              <input
                type="number"
                value={targetSdk}
                onChange={(e) => setTargetSdk(Number(e.target.value))}
                className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#dfe1e5]">Version Code:</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(Number(e.target.value))}
                className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#dfe1e5]">Version Name:</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-white outline-none focus:border-[#3ddc84] font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#9da0a8] hover:text-white rounded-lg transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold rounded-lg transition shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ الإعدادات' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
