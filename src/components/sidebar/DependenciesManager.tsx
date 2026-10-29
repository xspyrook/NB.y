import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  Check,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Server,
  RefreshCw,
} from 'lucide-react';
import { AndroidProject, FileItem, MavenDependency } from '../../types';
import { findFileByPath } from '../../services/templates';

interface DependenciesManagerProps {
  project: AndroidProject;
  onUpdateFileContent: (fileId: string, newContent: string) => void;
  onSync: () => void;
  lang: 'ar' | 'en';
}

export const DependenciesManager: React.FC<DependenciesManagerProps> = ({
  project,
  onUpdateFileContent,
  onSync,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'deps' | 'sdk'>('deps');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MavenDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedCoord, setAddedCoord] = useState<string | null>(null);

  // Curated popular Android libraries
  const popularLibs: MavenDependency[] = [
    {
      groupId: 'androidx.compose.material3',
      artifactId: 'material3',
      version: '1.3.1',
      coordinate: 'androidx.compose.material3:material3:1.3.1',
      gradleImplementation: 'implementation("androidx.compose.material3:material3:1.3.1")',
      description: 'مكونات Material Design 3 الرسمية لواجهات Jetpack Compose الحديثة',
      category: 'UI',
    },
    {
      groupId: 'org.jetbrains.kotlinx',
      artifactId: 'kotlinx-coroutines-android',
      version: '1.9.0',
      coordinate: 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0',
      gradleImplementation: 'implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")',
      description: 'دعم البرمجة غير المتزامنة وخيوط التنفيذ الخلفية في أندرويد',
      category: 'Async',
    },
    {
      groupId: 'com.squareup.retrofit2',
      artifactId: 'retrofit',
      version: '2.11.0',
      coordinate: 'com.squareup.retrofit2:retrofit:2.11.0',
      gradleImplementation: 'implementation("com.squareup.retrofit2:retrofit:2.11.0")',
      description: 'عميل HTTP لإجراء اتصالات REST API وشبكة الإنترنت بكفاءة عالية',
      category: 'Network',
    },
    {
      groupId: 'io.coil-kt',
      artifactId: 'coil-compose',
      version: '2.7.0',
      coordinate: 'io.coil-kt:coil-compose:2.7.0',
      gradleImplementation: 'implementation("io.coil-kt:coil-compose:2.7.0")',
      description: 'مكتبة سريعة وخفيفة لتحميل وعرض الصور من الإنترنت مع دعم Compose',
      category: 'Media',
    },
    {
      groupId: 'com.google.code.gson',
      artifactId: 'gson',
      version: '2.11.0',
      coordinate: 'com.google.code.gson:gson:2.11.0',
      gradleImplementation: 'implementation("com.google.code.gson:gson:2.11.0")',
      description: 'تحويل وتفكيك بيانات JSON إلى كائنات Kotlin و Java والعكس',
      category: 'JSON',
    },
    {
      groupId: 'androidx.navigation',
      artifactId: 'navigation-compose',
      version: '2.8.5',
      coordinate: 'androidx.navigation:navigation-compose:2.8.5',
      gradleImplementation: 'implementation("androidx.navigation:navigation-compose:2.8.5")',
      description: 'إدارة التنقل بين شاشات التطبيق في Jetpack Compose بسهولة',
      category: 'Nav',
    },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/maven/search?q=${encodeURIComponent(query)}&rows=10`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error('Maven search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const addDependencyToGradle = (dep: MavenDependency) => {
    const gradleFile = findFileByPath(project.files, 'app/build.gradle.kts');
    if (!gradleFile || !gradleFile.content) return;

    if (gradleFile.content.includes(dep.artifactId)) {
      alert(isAr ? 'هذه الحزمة مضافة بالفعل إلى ملف build.gradle.kts!' : 'Package already added to build.gradle.kts!');
      return;
    }

    const implLine = `    ${dep.gradleImplementation}\n`;
    let newContent = gradleFile.content;

    if (newContent.includes('dependencies {')) {
      newContent = newContent.replace('dependencies {', `dependencies {\n${implLine}`);
    } else {
      newContent += `\ndependencies {\n${implLine}}\n`;
    }

    onUpdateFileContent(gradleFile.id, newContent);
    setAddedCoord(dep.coordinate);
    onSync();
    setTimeout(() => setAddedCoord(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] select-none overflow-hidden">
      {/* Sub Tabs: Dependencies vs SDK Manager */}
      <div className="h-9 bg-[#26282b] border-b border-[#393b40] flex items-center px-2 space-x-2 rtl:space-x-reverse text-xs">
        <button
          onClick={() => setActiveTab('deps')}
          className={`px-3 py-1 rounded transition font-medium ${
            activeTab === 'deps'
              ? 'bg-[#3ddc84] text-black font-bold'
              : 'text-[#9da0a8] hover:text-white hover:bg-[#35373c]'
          }`}
        >
          {isAr ? 'إدارة الاعتماديات (Maven)' : 'Dependencies'}
        </button>
        <button
          onClick={() => setActiveTab('sdk')}
          className={`px-3 py-1 rounded transition font-medium ${
            activeTab === 'sdk'
              ? 'bg-[#3ddc84] text-black font-bold'
              : 'text-[#9da0a8] hover:text-white hover:bg-[#35373c]'
          }`}
        >
          {isAr ? 'أدوات Android SDK & Gradle' : 'SDK & Tools'}
        </button>
      </div>

      {activeTab === 'deps' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Maven Search Box */}
          <div className="flex items-center gap-1.5 bg-[#2b2d30] border border-[#393b40] rounded-lg px-2.5 py-1.5 text-xs">
            <Search className="w-4 h-4 text-[#9da0a8]" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث في مستودع Maven Central (مثل: retrofit, coil)...' : 'Search Maven Central...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="bg-transparent border-none outline-none text-[#dfe1e5] w-full text-xs font-mono"
            />
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3ddc84]" />}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-[#3ddc84] uppercase tracking-wider">
                {isAr ? 'نتائج البحث في Maven Central:' : 'Maven Search Results:'}
              </h4>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#2b2d30] border border-[#393b40] rounded-lg hover:border-[#3ddc84]/50 transition flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <p className="font-mono text-xs font-semibold text-white truncate">{item.artifactId}</p>
                    <p className="font-mono text-[10px] text-[#9da0a8] truncate">{item.groupId} : {item.version}</p>
                  </div>
                  <button
                    onClick={() => addDependencyToGradle(item)}
                    className="px-2.5 py-1 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold text-xs rounded flex items-center gap-1 shrink-0 transition"
                  >
                    {addedCoord === item.coordinate ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Curated Popular Libraries */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#9da0a8] uppercase tracking-wider">
              {isAr ? 'مكتبات أندرويد الأكثر استخداماً:' : 'Recommended Android Libraries:'}
            </h4>

            {popularLibs.map((lib, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#26282b] border border-[#393b40] rounded-xl hover:border-[#4e5157] transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#3ddc84]/20 text-[#3ddc84]">
                      {lib.category}
                    </span>
                    <span className="font-mono font-bold text-xs text-white">{lib.artifactId}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9da0a8]">{lib.version}</span>
                </div>

                <p className="text-[11px] text-[#9da0a8] leading-relaxed">
                  {lib.description}
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <code className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]">
                    {lib.groupId}
                  </code>
                  <button
                    onClick={() => addDependencyToGradle(lib)}
                    className="px-2.5 py-1 bg-[#2b2d30] hover:bg-[#3ddc84] hover:text-black text-[#dfe1e5] border border-[#393b40] font-bold text-[11px] rounded flex items-center gap-1 transition"
                  >
                    {addedCoord === lib.coordinate ? (
                      <>
                        <Check className="w-3 h-3 text-[#3ddc84]" />
                        <span>{isAr ? 'تمت الإضافة' : 'Added'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>{isAr ? 'إضافة للمشروع' : 'Add to Gradle'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SDK & Gradle Environment Status Tab */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="p-3 bg-[#26282b] border border-[#393b40] rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#3ddc84] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>{isAr ? 'بيئة بناء وتجميع أندرويد' : 'Android Build Environment'}</span>
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#393b40]/60">
                <span className="text-[#9da0a8]">Kotlin Compiler:</span>
                <span className="text-white font-semibold">kotlinc 2.1.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#393b40]/60">
                <span className="text-[#9da0a8]">Gradle Wrapper:</span>
                <span className="text-white font-semibold">v8.10.2</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#393b40]/60">
                <span className="text-[#9da0a8]">Android Gradle Plugin:</span>
                <span className="text-white font-semibold">AGP 8.8.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#393b40]/60">
                <span className="text-[#9da0a8]">DEX Builder:</span>
                <span className="text-white font-semibold">D8 / R8 8.5.35</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#393b40]/60">
                <span className="text-[#9da0a8]">AAPT2:</span>
                <span className="text-white font-semibold">v8.8.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#9da0a8]">Java Runtime:</span>
                <span className="text-white font-semibold">OpenJDK 17 (JVM 17)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#26282b] border border-[#393b40] rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#dfe1e5] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#3ddc84]" />
              <span>{isAr ? 'إصدارات Android SDK المستهدفة' : 'Target Android Platforms'}</span>
            </h4>
            <div className="space-y-1 text-xs">
              <div className="p-2 bg-[#1e1f22] rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">Android 15 (Vanilla Ice Cream)</p>
                  <p className="text-[10px] text-[#9da0a8] font-mono">API Level 35 (Compile SDK)</p>
                </div>
                <span className="text-[10px] font-bold text-[#3ddc84] bg-[#3ddc84]/15 px-2 py-0.5 rounded">نشط</span>
              </div>
              <div className="p-2 bg-[#1e1f22] rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">Android 8.0 (Oreo)</p>
                  <p className="text-[10px] text-[#9da0a8] font-mono">API Level 26 (Min SDK المطلوبة)</p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded">الحد الأدنى</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#26282b] border border-[#393b40] rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-[#dfe1e5] flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'حالة مستودعات الحزم' : 'Repositories Status'}</span>
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#9da0a8]">Google Maven (maven.google.com)</span>
                <span className="text-[10px] text-[#3ddc84] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3ddc84]" /> متصل
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#9da0a8]">Maven Central (repo1.maven.org)</span>
                <span className="text-[10px] text-[#3ddc84] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3ddc84]" /> متصل
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
