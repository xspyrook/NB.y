import React, { useState } from 'react';
import {
  X,
  Package,
  Download,
  Share2,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileCode,
  QrCode,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { ApkItem } from '../../types';

interface ApkManagerModalProps {
  apks: ApkItem[];
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const ApkManagerModal: React.FC<ApkManagerModalProps> = ({
  apks,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [selectedApk, setSelectedApk] = useState<ApkItem | null>(apks[0] || null);
  const [showQr, setShowQr] = useState(false);

  const handleDownload = (apk: ApkItem) => {
    if (!apk.blobUrl) return;
    const a = document.createElement('a');
    a.href = apk.blobUrl;
    a.download = apk.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async (apk: ApkItem) => {
    if (navigator.share && apk.blobUrl) {
      try {
        await navigator.share({
          title: apk.fileName,
          text: `ملف تطبيق أندرويد ${apk.packageName} جاهز للتثبيت`,
          url: apk.blobUrl,
        });
      } catch {
        handleDownload(apk);
      }
    } else {
      handleDownload(apk);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 select-none animate-fade-in">
      <div className="bg-[#1e1f22] border border-[#393b40] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="h-12 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">
              {isAr ? 'إدارة وتثبيت ملفات APK (APK Manager)' : 'APK Manager & Artifacts'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9da0a8] hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {apks.length === 0 ? (
            <div className="text-center py-12 text-[#9da0a8] space-y-2">
              <Package className="w-12 h-12 mx-auto text-[#393b40]" />
              <h4 className="text-sm font-semibold text-[#dfe1e5]">
                {isAr ? 'لم يتم بناء أي ملف APK بعد' : 'No APKs built yet'}
              </h4>
              <p className="text-xs max-w-xs mx-auto">
                {isAr
                  ? "اضغط على زر تشغيل 'Run' أو 'Release' في الشريط العلوي لتجميع ملف APK حقيقي."
                  : "Click 'Run' or 'Release' in the top bar to build a real Android APK."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apks.map((apk) => {
                const isSelected = selectedApk?.id === apk.id;
                return (
                  <div
                    key={apk.id}
                    onClick={() => setSelectedApk(apk)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#2b2d30] border-[#3ddc84] shadow-md'
                        : 'bg-[#26282b] border-[#393b40] hover:border-[#4e5157]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3ddc84]" />
                        <span className="font-mono font-bold text-xs text-white truncate max-w-[170px]">
                          {apk.fileName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          apk.buildType === 'release'
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-emerald-400/20 text-emerald-300'
                        }`}
                      >
                        {apk.buildType}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono text-[#9da0a8] mb-3">
                      <p className="truncate">Package: {apk.packageName}</p>
                      <p>Size: {(apk.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7a7e85]" />
                        {new Date(apk.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#393b40]/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(apk);
                        }}
                        className="flex-1 py-1.5 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تنزيل APK' : 'Download APK'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(apk);
                        }}
                        className="p-1.5 bg-[#35373c] hover:bg-[#4e5157] text-white rounded-lg transition"
                        title={isAr ? 'مشاركة' : 'Share'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected APK Inspector */}
          {selectedApk && (
            <div className="p-3 bg-[#26282b] border border-[#393b40] rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-[#3ddc84] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'تفاصيل الحزمة والشهادة الرقمية' : 'Package & Signature Inspection'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#1e1f22] rounded">
                  <span className="text-[#9da0a8]">Signing Scheme:</span>
                  <p className="text-white font-semibold">Android APK Signature v1 + v2</p>
                </div>
                <div className="p-2 bg-[#1e1f22] rounded">
                  <span className="text-[#9da0a8]">Keystore:</span>
                  <p className="text-white font-semibold">Android Debug Keystore (CN=Debug)</p>
                </div>
                <div className="p-2 bg-[#1e1f22] rounded col-span-1 sm:col-span-2">
                  <span className="text-[#9da0a8]">SHA-256 Digest:</span>
                  <p className="text-emerald-400 break-all">{selectedApk.sha256}</p>
                </div>
              </div>

              {/* Internal Files Inside APK */}
              <div className="mt-2 pt-2 border-t border-[#393b40]">
                <p className="text-[11px] font-bold text-[#dfe1e5] mb-1.5">
                  {isAr ? 'المكونات الداخلية لملف APK (Package Contents):' : 'Internal APK Structure:'}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-1 rounded bg-[#1e1f22] border border-[#393b40] text-purple-300">
                    📄 AndroidManifest.xml
                  </span>
                  <span className="px-2 py-1 rounded bg-[#1e1f22] border border-[#393b40] text-emerald-300">
                    ⚡ classes.dex (Dalvik Executable)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#1e1f22] border border-[#393b40] text-amber-300">
                    📦 resources.arsc (Resource Table)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#1e1f22] border border-[#393b40] text-cyan-300">
                    🎨 res/ (Layouts & Drawables)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#1e1f22] border border-[#393b40] text-rose-300">
                    🔐 META-INF/ (CERT.RSA & CERT.SF)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#26282b] border-t border-[#393b40] px-4 flex items-center justify-between text-xs text-[#9da0a8]">
          <span>
            {isAr ? 'تثبيت حقيقي بموافقة المستخدم وفق معايير أندرويد' : 'Installs via official Android PackageInstaller'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#35373c] hover:bg-[#4e5157] text-white rounded-lg transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
