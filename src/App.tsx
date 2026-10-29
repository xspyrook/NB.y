import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Package,
  Sparkles,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Menu,
  FileCode,
  Download,
  AlertCircle,
} from 'lucide-react';
import { AndroidProject, FileItem, BuildLogItem, ApkItem, ProblemItem, LogcatMessage } from './types';
import {
  createDefaultComposeProject,
  createDefaultXmlProject,
  flattenFiles,
  findFileById,
  findFileByPath,
  updateFileContentInTree,
} from './services/templates';
import { runGradleBuild, exportAndroidStudioProjectZip } from './services/apkBuilder';
import { lintFile } from './services/linter';

// Components
import { Header } from './components/layout/Header';
import { CodeEditor } from './components/editor/CodeEditor';
import { LayoutPreview } from './components/preview/LayoutPreview';
import { ProjectTree } from './components/sidebar/ProjectTree';
import { DependenciesManager } from './components/sidebar/DependenciesManager';
import { AiAssistantPanel } from './components/sidebar/AiAssistantPanel';
import { BottomPanel } from './components/bottom/BottomPanel';
import { ApkManagerModal } from './components/sidebar/ApkManagerModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { NativeSourceModal } from './components/modals/NativeSourceModal';
import { DownloadAppModal } from './components/modals/DownloadAppModal';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isAr = lang === 'ar';

  // Project state
  const [project, setProject] = useState<AndroidProject>(() => {
    const saved = localStorage.getItem('as_mobile_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return createDefaultComposeProject();
  });

  // Sidebar navigation tab
  const [sidebarTab, setSidebarTab] = useState<'project' | 'deps' | 'ai'>('project');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Layout Preview toggle
  const [showPreview, setShowPreview] = useState(true);

  // Modals state
  const [showApkModal, setShowApkModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNativeSourceModal, setShowNativeSourceModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Bottom panel state
  const [showBottomPanel, setShowBottomPanel] = useState(false);

  // Build state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<BuildLogItem[]>([
    {
      id: 'init_1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Android Studio Mobile IDE initialized. Gradle daemon standing by.',
    },
  ]);

  // APK list
  const [apks, setApks] = useState<ApkItem[]>([]);

  // Logcat stream
  const [logcat, setLogcat] = useState<LogcatMessage[]>([
    {
      id: 'l_1',
      timestamp: '12:51:00.120',
      level: 'I',
      tag: 'ActivityManager',
      message: 'Start proc 12431:com.my.androidstudio/u0a142 for launch activity',
    },
    {
      id: 'l_2',
      timestamp: '12:51:00.450',
      level: 'D',
      tag: 'MainActivity',
      message: 'onCreate: EdgeToEdge enabled, Compose initialized successfully.',
    },
  ]);

  // Persist project changes
  useEffect(() => {
    localStorage.setItem('as_mobile_project', JSON.stringify(project));
  }, [project]);

  // Active file item
  const activeFile = useMemo(() => {
    return findFileById(project.files, project.activeFileId);
  }, [project.files, project.activeFileId]);

  // Open file items
  const openFiles = useMemo(() => {
    return project.openFileIds
      .map((id) => findFileById(project.files, id))
      .filter((f): f is FileItem => f !== null);
  }, [project.files, project.openFileIds]);

  // Real-time lint problems
  const problems = useMemo(() => {
    const list: ProblemItem[] = [];
    openFiles.forEach((file) => {
      list.push(...lintFile(file));
    });
    return list;
  }, [openFiles]);

  // Select tab
  const handleSelectTab = (fileId: string) => {
    setProject((prev) => ({
      ...prev,
      activeFileId: fileId,
      openFileIds: prev.openFileIds.includes(fileId) ? prev.openFileIds : [...prev.openFileIds, fileId],
    }));
  };

  // Close tab
  const handleCloseTab = (fileId: string) => {
    setProject((prev) => {
      const remaining = prev.openFileIds.filter((id) => id !== fileId);
      const nextActive = prev.activeFileId === fileId ? (remaining[0] || '') : prev.activeFileId;
      return {
        ...prev,
        openFileIds: remaining,
        activeFileId: nextActive,
      };
    });
  };

  // File content change
  const handleContentChange = (fileId: string, newContent: string) => {
    setProject((prev) => ({
      ...prev,
      files: updateFileContentInTree(prev.files, fileId, newContent),
      lastModified: Date.now(),
    }));
  };

  // Save file
  const handleSaveFile = (fileId: string) => {
    setProject((prev) => {
      const markSaved = (items: FileItem[]): FileItem[] =>
        items.map((item) => {
          if (item.id === fileId) return { ...item, isModified: false };
          if (item.children) return { ...item, children: markSaved(item.children) };
          return item;
        });
      return { ...prev, files: markSaved(prev.files) };
    });
  };

  // Create new file / folder
  const handleCreateFile = (parentPath: string, name: string, type: 'file' | 'directory', fileLang?: any) => {
    const newId = `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullPath = `${parentPath}/${name}`;

    const newItem: FileItem = {
      id: newId,
      name,
      path: fullPath,
      type,
      language: fileLang || 'kotlin',
      content: type === 'file' ? (name.endsWith('.kt') ? `package ${project.packageName}\n\n// New Kotlin file\n` : '') : undefined,
      children: type === 'directory' ? [] : undefined,
      isModified: true,
    };

    const addRecursive = (items: FileItem[]): FileItem[] =>
      items.map((item) => {
        if (item.path === parentPath && item.type === 'directory') {
          return {
            ...item,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children) {
          return { ...item, children: addRecursive(item.children) };
        }
        return item;
      });

    setProject((prev) => ({
      ...prev,
      files: addRecursive(prev.files),
      activeFileId: type === 'file' ? newId : prev.activeFileId,
      openFileIds: type === 'file' ? [...prev.openFileIds, newId] : prev.openFileIds,
    }));
  };

  // Delete file
  const handleDeleteFile = (fileId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الملف؟' : 'Are you sure you want to delete this file?')) return;

    const removeRecursive = (items: FileItem[]): FileItem[] =>
      items
        .filter((item) => item.id !== fileId)
        .map((item) => {
          if (item.children) return { ...item, children: removeRecursive(item.children) };
          return item;
        });

    setProject((prev) => {
      const remainingOpen = prev.openFileIds.filter((id) => id !== fileId);
      const nextActive = prev.activeFileId === fileId ? (remainingOpen[0] || '') : prev.activeFileId;
      return {
        ...prev,
        files: removeRecursive(prev.files),
        openFileIds: remainingOpen,
        activeFileId: nextActive,
      };
    });
  };

  // Rename file
  const handleRenameFile = (fileId: string, newName: string) => {
    const renameRecursive = (items: FileItem[]): FileItem[] =>
      items.map((item) => {
        if (item.id === fileId) {
          const parts = item.path.split('/');
          parts[parts.length - 1] = newName;
          return { ...item, name: newName, path: parts.join('/') };
        }
        if (item.children) return { ...item, children: renameRecursive(item.children) };
        return item;
      });

    setProject((prev) => ({
      ...prev,
      files: renameRecursive(prev.files),
    }));
  };

  // Run Gradle Build (Assemble APK)
  const handleRunBuild = async (variant: 'debug' | 'release' = 'debug') => {
    if (isBuilding) return;
    setIsBuilding(true);
    setBuildProgress(5);
    setShowBottomPanel(true);

    try {
      const apk = await runGradleBuild(project, variant, {
        onLog: (log) => setBuildLogs((prev) => [...prev, log]),
        onProgress: (p, task) => setBuildProgress(p),
      });

      setApks((prev) => [apk, ...prev]);

      // Add to logcat
      setLogcat((prev) => [
        {
          id: `logcat_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'I',
          tag: 'PackageManager',
          message: `Application package ${project.packageName} verified and ready for install.`,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setBuildLogs((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'error',
          message: `BUILD FAILED: ${err?.message || 'Check build logs'}`,
        },
      ]);
    } finally {
      setIsBuilding(false);
      setBuildProgress(100);
    }
  };

  // Sync Gradle
  const handleSyncGradle = () => {
    setIsBuilding(true);
    setBuildProgress(20);
    setShowBottomPanel(true);

    setBuildLogs((prev) => [
      ...prev,
      {
        id: `sync_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: 'Gradle Sync started: evaluating settings.gradle.kts and app/build.gradle.kts...',
      },
    ]);

    setTimeout(() => {
      setBuildProgress(100);
      setIsBuilding(false);
      setBuildLogs((prev) => [
        ...prev,
        {
          id: `sync_done_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          level: 'success',
          message: 'Gradle Sync finished: 12 dependencies resolved from Google Maven & Maven Central in 0.8s.',
        },
      ]);
    }, 900);
  };

  // Export full project as ZIP
  const handleExportZip = async () => {
    try {
      const blob = await exportAndroidStudioProjectZip(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_android_studio_project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Export error: ${err?.message}`);
    }
  };

  // Create new project wizard callback
  const handleCreateProject = (name: string, packageName: string, uiType: any, minSdk: number) => {
    const newProj = uiType === 'xml'
      ? createDefaultXmlProject(name, packageName, minSdk)
      : createDefaultComposeProject(name, packageName, minSdk);
    setProject(newProj);
    setBuildLogs([
      {
        id: `init_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Created new project '${name}' (${packageName}) with ${uiType.toUpperCase()} architecture.`,
      },
    ]);
  };

  // Send interactive logcat
  const handleSendLogcat = (tag: string, message: string) => {
    setLogcat((prev) => [
      {
        id: `l_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'D',
        tag,
        message,
      },
      ...prev,
    ]);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen bg-[#1e1f22] text-[#dfe1e5] overflow-hidden select-none font-sans"
    >
      {/* 1. IDE Main Header */}
      <Header
        project={project}
        isBuilding={isBuilding}
        buildProgress={buildProgress}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
        showAi={sidebarTab === 'ai' && isSidebarOpen}
        onToggleAi={() => {
          if (sidebarTab === 'ai' && isSidebarOpen) {
            setIsSidebarOpen(false);
          } else {
            setSidebarTab('ai');
            setIsSidebarOpen(true);
          }
        }}
        showApkModal={showApkModal}
        onToggleApkModal={() => setShowApkModal(!showApkModal)}
        showBottomPanel={showBottomPanel}
        onToggleBottomPanel={() => setShowBottomPanel(!showBottomPanel)}
        onRunBuild={handleRunBuild}
        onSyncGradle={handleSyncGradle}
        onExportZip={handleExportZip}
        onNewProject={() => setShowNewProjectModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onViewNativeSource={() => setShowNativeSourceModal(true)}
        onOpenDownloadApp={() => setShowDownloadModal(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      />

      {/* 2. Workspace Body (Sidebar Strip + Sidebar Panel + Editor + Preview) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Leftmost Icon Strip (Android Studio Tool Windows Bar) */}
        <div className="w-10 bg-[#1e1f22] border-r border-[#393b40] flex flex-col items-center py-2 space-y-3 z-10 shrink-0">
          <button
            onClick={() => {
              if (sidebarTab === 'project' && isSidebarOpen) {
                setIsSidebarOpen(false);
              } else {
                setSidebarTab('project');
                setIsSidebarOpen(true);
              }
            }}
            title={isAr ? 'شجرة ملفات المشروع (Project)' : 'Project Files'}
            className={`p-2 rounded-lg transition ${
              sidebarTab === 'project' && isSidebarOpen
                ? 'bg-[#3ddc84]/20 text-[#3ddc84] border border-[#3ddc84]/40'
                : 'text-[#9da0a8] hover:text-white hover:bg-[#2b2d30]'
            }`}
          >
            <FolderTree className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (sidebarTab === 'deps' && isSidebarOpen) {
                setIsSidebarOpen(false);
              } else {
                setSidebarTab('deps');
                setIsSidebarOpen(true);
              }
            }}
            title={isAr ? 'مدير الاعتماديات وSDK (Dependencies)' : 'Dependencies & SDK'}
            className={`p-2 rounded-lg transition ${
              sidebarTab === 'deps' && isSidebarOpen
                ? 'bg-[#3ddc84]/20 text-[#3ddc84] border border-[#3ddc84]/40'
                : 'text-[#9da0a8] hover:text-white hover:bg-[#2b2d30]'
            }`}
          >
            <Package className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (sidebarTab === 'ai' && isSidebarOpen) {
                setIsSidebarOpen(false);
              } else {
                setSidebarTab('ai');
                setIsSidebarOpen(true);
              }
            }}
            title={isAr ? 'مساعد الذكاء الاصطناعي (AI Assistant)' : 'AI Assistant'}
            className={`p-2 rounded-lg transition ${
              sidebarTab === 'ai' && isSidebarOpen
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-[#9da0a8] hover:text-white hover:bg-[#2b2d30]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </button>

          <div className="flex-1" />

          {/* Quick toggle sidebar visibility */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-[#9da0a8] hover:text-white"
            title={isSidebarOpen ? 'طي القائمة' : 'فتح القائمة'}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> : <ChevronRight className="w-4 h-4 rtl:rotate-180" />}
          </button>
        </div>

        {/* Collapsible Tool Window Panel */}
        {isSidebarOpen && (
          <div className="w-64 sm:w-72 bg-[#1e1f22] border-r border-[#393b40] flex flex-col h-full shrink-0 z-10 transition-all">
            {sidebarTab === 'project' && (
              <ProjectTree
                project={project}
                activeFileId={project.activeFileId}
                onSelectFile={handleSelectTab}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                lang={lang}
              />
            )}
            {sidebarTab === 'deps' && (
              <DependenciesManager
                project={project}
                onUpdateFileContent={handleContentChange}
                onSync={handleSyncGradle}
                lang={lang}
              />
            )}
            {sidebarTab === 'ai' && (
              <AiAssistantPanel
                activeFile={activeFile}
                buildLogs={buildLogs.map((l) => l.message).join('\n')}
                onApplyCode={(code) => {
                  if (activeFile) {
                    handleContentChange(activeFile.id, code);
                  }
                }}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* Main Code Editor Area */}
        <CodeEditor
          activeFile={activeFile}
          openFiles={openFiles}
          problems={problems}
          onSelectTab={handleSelectTab}
          onCloseTab={handleCloseTab}
          onContentChange={handleContentChange}
          onSaveFile={handleSaveFile}
          lang={lang}
        />

        {/* Live Visual Android Layout Previewer */}
        {showPreview && (
          <LayoutPreview
            project={project}
            activeFile={activeFile}
            onSendLogcat={handleSendLogcat}
            lang={lang}
          />
        )}
      </div>

      {/* 3. Bottom Panel (Build Logs, Terminal, Problems, Logcat, Tests) */}
      <BottomPanel
        logs={buildLogs}
        problems={problems}
        logcat={logcat}
        project={project}
        isOpen={showBottomPanel}
        onToggleOpen={() => setShowBottomPanel(!showBottomPanel)}
        onClearLogs={() => setBuildLogs([])}
        onClearLogcat={() => setLogcat([])}
        onSelectProblemFile={(fileId, line) => {
          handleSelectTab(fileId);
        }}
        onRunBuild={() => handleRunBuild('debug')}
        lang={lang}
      />

      {/* 4. Modals */}
      {showApkModal && (
        <ApkManagerModal
          apks={apks}
          onClose={() => setShowApkModal(false)}
          lang={lang}
        />
      )}

      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
          lang={lang}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          project={project}
          onSaveSettings={(updated) => setProject((prev) => ({ ...prev, ...updated }))}
          lang={lang}
        />
      )}

      {showNativeSourceModal && (
        <NativeSourceModal
          isOpen={showNativeSourceModal}
          onClose={() => setShowNativeSourceModal(false)}
          lang={lang}
        />
      )}

      {showDownloadModal && (
        <DownloadAppModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onExportNativeZip={() => {
            setShowDownloadModal(false);
            setShowNativeSourceModal(true);
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
