import React, { useState } from 'react';
import {
  Smartphone,
  RotateCw,
  Sun,
  Moon,
  Plus,
  Play,
  Code2,
  CheckCircle2,
  Wifi,
  Battery,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AndroidProject, FileItem } from '../../types';

interface LayoutPreviewProps {
  project: AndroidProject;
  activeFile: FileItem | null;
  onSendLogcat?: (tag: string, message: string) => void;
  lang: 'ar' | 'en';
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  project,
  activeFile,
  onSendLogcat,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [phoneTheme, setPhoneTheme] = useState<'dark' | 'light'>('dark');
  const [counter, setCounter] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    onSendLogcat?.('MainActivity', `UI Action: ${msg}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Inspect if current file is XML layout
  const isXmlLayout = activeFile?.name.endsWith('.xml') && activeFile.path.includes('layout');
  const isCompose = activeFile?.name.endsWith('.kt') || project.uiType === 'compose';

  // Extract titles and texts from XML or default
  let xmlTitle = project.name;
  let xmlSubtitle = 'Android Studio Mobile Live Preview';
  let btnLabel = 'اضغط هنا للتفاعل';

  if (isXmlLayout && activeFile?.content) {
    const titleMatch = activeFile.content.match(/android:text="([^"]+)"/);
    if (titleMatch) xmlTitle = titleMatch[1];
  }

  return (
    <div className="w-80 sm:w-96 md:w-[420px] bg-[#1e1f22] border-l border-[#393b40] flex flex-col h-full select-none shrink-0 overflow-hidden">
      {/* Preview Header Toolbar */}
      <div className="h-9 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-3 text-xs text-[#9da0a8]">
        <div className="flex items-center gap-1.5 font-medium text-[#dfe1e5]">
          <Smartphone className="w-4 h-4 text-[#3ddc84]" />
          <span>{isAr ? 'معاينة الجهاز المباشرة' : 'Device Preview'}</span>
          <span className="text-[10px] bg-[#393b40] text-[#3ddc84] px-1.5 py-0.5 rounded font-mono">
            {project.uiType === 'compose' ? 'Compose' : 'XML Views'}
          </span>
        </div>

        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            title={isAr ? 'تدوير الشاشة' : 'Rotate Device'}
            className="p-1 hover:text-white hover:bg-[#393b40] rounded transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPhoneTheme(phoneTheme === 'dark' ? 'light' : 'dark')}
            title={isAr ? 'تبديل السمة' : 'Toggle Theme'}
            className="p-1 hover:text-white hover:bg-[#393b40] rounded transition"
          >
            {phoneTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Device Viewport Area */}
      <div className="flex-1 bg-[#18191b] p-3 flex items-center justify-center overflow-auto">
        <div
          className={`android-phone-frame transition-all duration-300 flex flex-col shadow-2xl ${
            orientation === 'portrait'
              ? 'w-[290px] h-[580px]'
              : 'w-[560px] h-[300px]'
          } ${phoneTheme === 'dark' ? 'bg-[#121316] text-white' : 'bg-[#f8f9fa] text-black'}`}
        >
          {/* Top Notch / Camera & Android Status Bar */}
          <div
            className={`h-7 px-4 flex items-center justify-between text-[11px] font-mono shrink-0 select-none ${
              phoneTheme === 'dark' ? 'bg-[#1e1f22] text-[#dfe1e5]' : 'bg-[#e9ecef] text-[#495057]'
            }`}
          >
            <span className="font-semibold">12:51</span>
            {/* Camera cutout punch-hole */}
            <div className="w-3 h-3 rounded-full bg-black mx-auto" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Android App Bar (TopAppBar) */}
          <div
            className={`h-12 px-4 flex items-center justify-between shadow-sm shrink-0 ${
              phoneTheme === 'dark'
                ? 'bg-[#2b2d30] border-b border-[#393b40] text-white'
                : 'bg-white border-b border-gray-200 text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#3ddc84] flex items-center justify-center text-black font-bold text-xs shadow-sm">
                🤖
              </div>
              <span className="font-bold text-xs truncate max-w-[170px] tracking-tight">
                {project.name}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#3ddc84]/20 text-[#3ddc84]">
              API {project.targetSdk}
            </span>
          </div>

          {/* Phone Screen Content (Interactive App UI) */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto relative">
            <div className="space-y-4">
              {/* Main Card UI */}
              <div
                className={`p-4 rounded-2xl border transition shadow-sm ${
                  phoneTheme === 'dark'
                    ? 'bg-[#232428] border-[#393b40]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3ddc84] animate-pulse" />
                  <span className="text-xs font-semibold text-[#3ddc84] uppercase tracking-wider">
                    {project.packageName}
                  </span>
                </div>

                <h3 className="text-sm font-bold leading-snug mb-1">
                  {xmlTitle}
                </h3>
                <p
                  className={`text-[11px] leading-relaxed ${
                    phoneTheme === 'dark' ? 'text-[#9da0a8]' : 'text-gray-600'
                  }`}
                >
                  {xmlSubtitle}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-[#3ddc84]/10 border border-[#3ddc84]/30 flex items-center justify-between">
                  <span className="text-xs font-medium">
                    {isAr ? 'عداد التفاعل:' : 'Interaction Counter:'}
                  </span>
                  <span className="text-lg font-black font-mono text-[#3ddc84]">
                    {counter}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => {
                  const newCount = counter + 1;
                  setCounter(newCount);
                  showToast(isAr ? `تم النقر! العداد: ${newCount}` : `Clicked! Counter: ${newCount}`);
                }}
                className="w-full h-11 bg-[#3ddc84] hover:bg-[#35c977] active:scale-98 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{btnLabel}</span>
              </button>

              <button
                onClick={() => {
                  showToast(isAr ? 'تم استدعاء نشاط Coroutines بنجاح' : 'Kotlin Coroutine task executed');
                }}
                className={`w-full h-9 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition ${
                  phoneTheme === 'dark'
                    ? 'border-[#393b40] hover:bg-[#2b2d30] text-[#dfe1e5]'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#3ddc84]" />
                <span>{isAr ? 'تشغيل دالة Kotlin' : 'Trigger Kotlin Function'}</span>
              </button>
            </div>

            {/* Floating Action Button (FAB) */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const newCount = counter + 1;
                  setCounter(newCount);
                  showToast(isAr ? 'تم النقر على Floating Action Button' : 'FAB Clicked');
                }}
                className="w-11 h-11 rounded-2xl bg-[#3ddc84] text-black shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition"
                title="Floating Action Button"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Android Toast notification simulator */}
            {toastMessage && (
              <div className="absolute bottom-6 left-4 right-4 bg-black/90 text-white text-[11px] px-3 py-2 rounded-full text-center shadow-2xl border border-white/10 animate-fade-in backdrop-blur-sm">
                {toastMessage}
              </div>
            )}
          </div>

          {/* Android Navigation Bar (Back, Home, Recents) */}
          <div
            className={`h-7 flex items-center justify-center gap-10 shrink-0 select-none ${
              phoneTheme === 'dark' ? 'bg-[#18191b]' : 'bg-[#e9ecef]'
            }`}
          >
            {/* Back (triangle) */}
            <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-gray-400 rotate-45 cursor-pointer" />
            {/* Home (circle) */}
            <div className="w-3 h-3 rounded-full border-2 border-gray-400 cursor-pointer" />
            {/* Recents (square) */}
            <div className="w-2.5 h-2.5 border-2 border-gray-400 rounded-xs cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};
