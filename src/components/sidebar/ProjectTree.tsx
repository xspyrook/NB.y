import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AndroidProject, FileItem } from '../../types';

interface ProjectTreeProps {
  project: AndroidProject;
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (parentPath: string, name: string, type: 'file' | 'directory', lang?: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  lang: 'ar' | 'en';
}

export const ProjectTree: React.FC<ProjectTreeProps> = ({
  project,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    app: true,
    'app/src': true,
    'app/src/main': true,
    'app/src/main/kotlin': true,
    [`app/src/main/kotlin/${project.packageName.replace(/\./g, '/')}`]: true,
    'app/src/main/res': true,
    'app/src/main/res/layout': true,
    'app/src/main/res/values': true,
  });

  const [newFileInput, setNewFileInput] = useState<{ parentPath: string; isDir: boolean } | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const getFileIcon = (file: FileItem) => {
    if (file.name === 'AndroidManifest.xml') {
      return <span className="text-[#3ddc84] font-black text-xs">M</span>;
    }
    if (file.name.endsWith('.kt')) {
      return <span className="text-purple-400 font-bold text-xs">K</span>;
    }
    if (file.name.endsWith('.xml')) {
      return <span className="text-amber-400 font-bold text-xs">&lt;&gt;</span>;
    }
    if (file.name.endsWith('.gradle.kts') || file.name.endsWith('.gradle')) {
      return <span className="text-cyan-400 font-bold text-xs">G</span>;
    }
    if (file.name.endsWith('.json')) {
      return <FileJson className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-blue-400" />;
  };

  const handleCreateConfirm = () => {
    if (!newFileInput || !newFileName.trim()) return;
    const name = newFileName.trim();
    let language: any = 'kotlin';
    if (name.endsWith('.xml')) language = 'xml';
    if (name.endsWith('.gradle.kts') || name.endsWith('.gradle')) language = 'gradle';
    if (name.endsWith('.json')) language = 'json';
    if (name.endsWith('.md')) language = 'markdown';

    onCreateFile(newFileInput.parentPath, name, newFileInput.isDir ? 'directory' : 'file', language);
    setNewFileInput(null);
    setNewFileName('');
  };

  const renderTree = (items: FileItem[], depth = 0) => {
    return items.map((item) => {
      const isExpanded = !!expandedFolders[item.path];
      const isActive = item.id === activeFileId;
      const isDirectory = item.type === 'directory';

      if (filterQuery && !item.name.toLowerCase().includes(filterQuery.toLowerCase()) && !isDirectory) {
        return null;
      }

      return (
        <div key={item.id} className="select-none">
          <div
            style={{ paddingLeft: `${depth * 14 + 8}px`, paddingRight: '8px' }}
            onClick={() => {
              if (isDirectory) {
                toggleFolder(item.path);
              } else {
                onSelectFile(item.id);
              }
            }}
            className={`group flex items-center justify-between py-1 px-2 rounded-md text-xs cursor-pointer transition ${
              isActive
                ? 'bg-[#37393e] text-white font-medium'
                : 'text-[#dfe1e5] hover:bg-[#26282b]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {isDirectory ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#9da0a8] shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#9da0a8] shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </>
              ) : (
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {getFileIcon(item)}
                </div>
              )}

              {renamingFileId === item.id ? (
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onRenameFile(item.id, renameInput);
                      setRenamingFileId(null);
                    } else if (e.key === 'Escape') {
                      setRenamingFileId(null);
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#1e1f22] border border-[#3ddc84] text-white px-1 py-0.5 rounded text-xs font-mono outline-none"
                />
              ) : (
                <span className="truncate">{item.name}</span>
              )}
            </div>

            {/* Hover Actions (New File, Rename, Delete) */}
            <div className="hidden group-hover:flex items-center gap-1">
              {isDirectory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewFileInput({ parentPath: item.path, isDir: false });
                    setExpandedFolders((prev) => ({ ...prev, [item.path]: true }));
                  }}
                  title={isAr ? 'ملف جديد' : 'New File'}
                  className="p-0.5 text-[#9da0a8] hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingFileId(item.id);
                  setRenameInput(item.name);
                }}
                title={isAr ? 'إعادة تسمية' : 'Rename'}
                className="p-0.5 text-[#9da0a8] hover:text-white"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(item.id);
                }}
                title={isAr ? 'حذف' : 'Delete'}
                className="p-0.5 text-[#9da0a8] hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* New File Inline Form */}
          {newFileInput?.parentPath === item.path && (
            <div
              style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}
              className="py-1 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={isAr ? 'اسم الملف (مثال: Screen.kt)...' : 'File name...'}
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateConfirm();
                  if (e.key === 'Escape') setNewFileInput(null);
                }}
                autoFocus
                className="bg-[#1e1f22] border border-[#3ddc84] text-white px-2 py-0.5 rounded text-xs font-mono outline-none w-36"
              />
              <button
                onClick={handleCreateConfirm}
                className="text-[10px] bg-[#3ddc84] text-black px-1.5 py-0.5 rounded font-bold"
              >
                ✓
              </button>
            </div>
          )}

          {/* Children items */}
          {isDirectory && isExpanded && item.children && (
            <div>{renderTree(item.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] select-none overflow-hidden">
      {/* Search Filter & Root Actions */}
      <div className="p-2 border-b border-[#393b40] space-y-1.5">
        <div className="flex items-center gap-1.5 bg-[#2b2d30] border border-[#393b40] rounded px-2 py-1 text-xs">
          <Search className="w-3.5 h-3.5 text-[#9da0a8]" />
          <input
            type="text"
            placeholder={isAr ? 'بحث في الملفات...' : 'Search files...'}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[#dfe1e5] w-full text-xs font-mono"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#9da0a8] px-1">
          <span className="font-semibold text-xs tracking-wider uppercase text-[#3ddc84]">
            Android
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewFileInput({ parentPath: 'app/src/main/kotlin', isDir: false })}
              className="hover:text-white flex items-center gap-1"
              title={isAr ? 'إضافة ملف Kotlin جديد' : 'New Kotlin File'}
            >
              <Plus className="w-3 h-3 text-[#3ddc84]" />
              <span>{isAr ? 'ملف جديد' : 'New File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files Tree List */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-xs space-y-0.5">
        {renderTree(project.files)}
      </div>
    </div>
  );
};
