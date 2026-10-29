import React from 'react';
import {
  Play,
  Hammer,
  RefreshCw,
  Smartphone,
  Sparkles,
  Package,
  Download,
  FolderOpen,
  Plus,
  Terminal,
  Settings,
  Code2,
  FileCode,
  Share2,
} from 'lucide-react';
import { AndroidProject } from '../../types';

interface HeaderProps {
  project: AndroidProject;
  isBuilding: boolean;
  buildProgress: number;
  showPreview: boolean;
  onTogglePreview: () => void;
  showAi: boolean;
  onToggleAi: () => void;
  showApkModal: boolean;
  onToggleApkModal: () => void;
  showBottomPanel: boolean;
  onToggleBottomPanel: () => void;
  onRunBuild: (variant: 'debug' | 'release') => void;
  onSyncGradle: () => void;
  onExportZip: () => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
  onViewNativeSource: () => void;
  onOpenDownloadApp: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  isBuilding,
  buildProgress,
  showPreview,
  onTogglePreview,
  showAi,
  onToggleAi,
  showApkModal,
  onToggleApkModal,
  showBottomPanel,
  onToggleBottomPanel,
  onRunBuild,
  onSyncGradle,
  onExportZip,
  onNewProject,
  onOpenSettings,
  onViewNativeSource,
  onOpenDownloadApp,
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="h-13 bg-[#1e1f22] border-b border-[#393b40] flex items-center justify-between px-2 md:px-4 z-30 select-none">
      {/* Left section: Logo & Project Info */}
      <div className="flex items-center space-x-2 md:space-x-3 rtl:space-x-reverse">
        {/* Android Studio Icon badge */}
        <div className="flex items-center gap-1.5 bg-[#2b2d30] hover:bg-[#35373c] text-white px-2.5 py-1.5 rounded-lg border border-[#393b40] cursor-pointer transition">
          <div className="w-5 h-5 rounded-full bg-[#3ddc84] flex items-center justify-center text-black font-bold text-xs shadow-sm">
            🤖
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs leading-none text-white tracking-wide">
              Android Studio
            </span>
            <span className="text-[10px] text-[#3ddc84] leading-tight font-mono font-medium">
              Mobile IDE
            </span>
          </div>
        </div>

        {/* Project Selector / Info */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#dfe1e5] bg-[#2b2d30] px-2.5 py-1.5 rounded-md border border-[#393b40]">
          <FolderOpen className="w-3.5 h-3.5 text-[#3ddc84]" />
          <span className="font-medium truncate max-w-[120px] md:max-w-[180px]">
            {project.name}
          </span>
          <span className="bg-[#1e1f22] text-[#9da0a8] text-[10px] px-1.5 py-0.5 rounded font-mono">
            :{project.buildVariant}
          </span>
        </div>

        {/* New Project Quick Button */}
        <button
          onClick={onNewProject}
          title={isAr ? 'مشروع جديد' : 'New Project'}
          className="p-1.5 text-[#9da0a8] hover:text-white hover:bg-[#2b2d30] rounded-md transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Middle section: Run & Build Actions */}
      <div className="flex items-center space-x-1.5 md:space-x-2 rtl:space-x-reverse">
        {/* Run 'app' Button (Primary Android Action) */}
        <button
          onClick={() => onRunBuild('debug')}
          disabled={isBuilding}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition shadow-sm ${
            isBuilding
              ? 'bg-[#3ddc84]/20 text-[#3ddc84] border border-[#3ddc84]/40 cursor-wait'
              : 'bg-[#3ddc84] text-black hover:bg-[#35c977] active:scale-95'
          }`}
          title={isAr ? "تشغيل وبناء تطبيق Debug APK" : "Run and Build Debug APK"}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isBuilding ? 'animate-pulse' : ''}`} />
          <span className="hidden xs:inline">
            {isBuilding ? `${isAr ? 'جاري البناء' : 'Building'} ${buildProgress}%` : isAr ? "تشغيل 'app'" : "Run 'app'"}
          </span>
        </button>

        {/* Build Hammer Button */}
        <button
          onClick={() => onRunBuild('release')}
          disabled={isBuilding}
          title={isAr ? 'بناء نسخة Release APK' : 'Make Release APK'}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#2b2d30] hover:bg-[#35373c] text-[#dfe1e5] border border-[#393b40] rounded-md text-xs transition"
        >
          <Hammer className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Release</span>
        </button>

        {/* Gradle Sync Button */}
        <button
          onClick={onSyncGradle}
          disabled={isBuilding}
          title={isAr ? 'مزامنة مع ملفات Gradle' : 'Sync Project with Gradle'}
          className="p-1.5 text-[#9da0a8] hover:text-[#3ddc84] hover:bg-[#2b2d30] rounded-md transition border border-transparent hover:border-[#393b40]"
        >
          <RefreshCw className={`w-4 h-4 ${isBuilding ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Right section: IDE Tools & Modals */}
      <div className="flex items-center space-x-1 md:space-x-1.5 rtl:space-x-reverse">
        {/* Toggle Live Layout Preview */}
        <button
          onClick={onTogglePreview}
          title={isAr ? 'معاينة الواجهة الحية' : 'Live UI Preview'}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition border ${
            showPreview
              ? 'bg-[#3ddc84]/15 text-[#3ddc84] border-[#3ddc84]/50 font-medium'
              : 'text-[#9da0a8] hover:text-white bg-[#2b2d30] border-[#393b40]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isAr ? 'المعاينة' : 'Preview'}</span>
        </button>

        {/* Toggle AI Assistant */}
        <button
          onClick={onToggleAi}
          title={isAr ? 'مساعد الذكاء الاصطناعي البرمجي' : 'AI Coding Assistant'}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition border ${
            showAi
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-medium'
              : 'text-[#9da0a8] hover:text-white bg-[#2b2d30] border-[#393b40]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">AI</span>
        </button>

        {/* APK Manager Button */}
        <button
          onClick={onToggleApkModal}
          title={isAr ? 'إدارة وتثبيت ملفات APK' : 'APK Manager & Installs'}
          className={`p-1.5 rounded-md text-xs transition border ${
            showApkModal
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'text-[#9da0a8] hover:text-white bg-[#2b2d30] border-[#393b40]'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Native Source Code for com.my.androidstudio */}
        <button
          onClick={onViewNativeSource}
          title={isAr ? 'كود تطبيق أندرويد الأصلي' : 'Native Kotlin Project Source'}
          className="hidden sm:flex items-center gap-1 p-1.5 text-[#9da0a8] hover:text-white bg-[#2b2d30] hover:bg-[#35373c] border border-[#393b40] rounded-md text-xs transition"
        >
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="hidden xl:inline text-[11px]">Native Src</span>
        </button>

        {/* Export Full Android Studio Project ZIP */}
        <button
          onClick={onExportZip}
          title={isAr ? 'تصدير مشروع Android Studio كامل (ZIP)' : 'Export Full Project (ZIP)'}
          className="p-1.5 text-[#9da0a8] hover:text-white bg-[#2b2d30] hover:bg-[#35373c] border border-[#393b40] rounded-md transition"
        >
          <Download className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Toggle Bottom Dock / Terminal */}
        <button
          onClick={onToggleBottomPanel}
          title={isAr ? 'لوحة الطرفية وسجل البناء' : 'Toggle Terminal / Console'}
          className={`p-1.5 rounded-md transition border ${
            showBottomPanel
              ? 'bg-[#3ddc84]/15 text-[#3ddc84] border-[#3ddc84]/40'
              : 'text-[#9da0a8] hover:text-white bg-[#2b2d30] border-[#393b40]'
          }`}
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Settings Modal */}
        <button
          onClick={onOpenSettings}
          title={isAr ? 'إعدادات المشروع' : 'Project Settings'}
          className="p-1.5 text-[#9da0a8] hover:text-white bg-[#2b2d30] hover:bg-[#35373c] border border-[#393b40] rounded-md transition"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Prominent Download Android App Button */}
        <button
          onClick={onOpenDownloadApp}
          title={isAr ? 'تحميل وتثبيت التطبيق على هاتف أندرويد (APK / PWA)' : 'Download Android App (APK / PWA)'}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-[#2ba863] hover:from-emerald-500 hover:to-[#3ddc84] text-white font-bold text-xs rounded-md shadow-md active:scale-95 transition border border-emerald-400/40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="font-extrabold">{isAr ? 'تحميل التطبيق' : 'Download App'}</span>
        </button>

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="px-2 py-1 text-[11px] font-bold text-[#dfe1e5] bg-[#2b2d30] hover:bg-[#35373c] border border-[#393b40] rounded-md transition"
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>
    </header>
  );
};
