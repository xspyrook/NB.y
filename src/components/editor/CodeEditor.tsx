import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Save,
  Search,
  RotateCcw,
  RotateCw,
  Code2,
  FileCode,
  FileText,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { FileItem, ProblemItem } from '../../types';
import { highlightCode } from '../../services/syntaxHighlighter';

interface CodeEditorProps {
  activeFile: FileItem | null;
  openFiles: FileItem[];
  problems: ProblemItem[];
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onContentChange: (fileId: string, newContent: string) => void;
  onSaveFile: (fileId: string) => void;
  lang: 'ar' | 'en';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  openFiles,
  problems,
  onSelectTab,
  onCloseTab,
  onContentChange,
  onSaveFile,
  lang,
}) => {
  const isAr = lang === 'ar';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Search & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  // Jump to line state
  const [jumpLine, setJumpLine] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Cursor position
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // History for Undo / Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (activeFile && activeFile.content !== undefined) {
      setHistory([activeFile.content]);
      setHistoryIndex(0);
    }
  }, [activeFile?.id]);

  // Update match count when searching
  useEffect(() => {
    if (!searchQuery || !activeFile?.content) {
      setMatchCount(0);
      return;
    }
    try {
      const matches = activeFile.content.split(searchQuery).length - 1;
      setMatchCount(matches);
    } catch {
      setMatchCount(0);
    }
  }, [searchQuery, activeFile?.content]);

  const handleTextChange = (newVal: string) => {
    if (!activeFile) return;
    onContentChange(activeFile.id, newVal);

    // Save to history (debounced in real app, simplified here)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0 && activeFile) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onContentChange(activeFile.id, prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && activeFile) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onContentChange(activeFile.id, next);
    }
  };

  // Keyboard shortcut insertion for mobile quick-bar
  const insertShortcut = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeFile) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = activeFile.content || '';

    const updated = current.substring(0, start) + snippet + current.substring(end);
    handleTextChange(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Handle Tab key and Auto-Indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertShortcut('    '); // 4 spaces
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (activeFile) onSaveFile(activeFile.id);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearch(!showSearch);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
  };

  // Track cursor position
  const handleSelectOrKeyUp = () => {
    const textarea = textareaRef.current;
    if (!textarea || !activeFile?.content) return;
    const pos = textarea.selectionStart;
    const textBefore = activeFile.content.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleReplaceAll = () => {
    if (!searchQuery || !activeFile?.content) return;
    const updated = activeFile.content.replaceAll(searchQuery, replaceQuery);
    handleTextChange(updated);
  };

  const handleJumpToLine = () => {
    const target = parseInt(jumpLine, 10);
    if (!target || !textareaRef.current || !activeFile?.content) return;
    const lines = activeFile.content.split('\n');
    if (target < 1 || target > lines.length) return;

    let charIndex = 0;
    for (let i = 0; i < target - 1; i++) {
      charIndex += lines[i].length + 1;
    }

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charIndex, charIndex);
    setShowJumpModal(false);
    setJumpLine('');
  };

  // Sync scrolling between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#2b2d30] flex flex-col items-center justify-center text-[#9da0a8] p-6">
        <Code2 className="w-16 h-16 text-[#393b40] mb-3" />
        <h3 className="text-base font-semibold text-[#dfe1e5]">لا يوجد ملف مفتوح</h3>
        <p className="text-xs text-center max-w-sm mt-1">
          اختر ملفاً من شجرة المشروع للبدء في كتابة كود Kotlin أو تصميم واجهات XML.
        </p>
      </div>
    );
  }

  const lines = (activeFile.content || '').split('\n');
  const fileProblems = problems.filter((p) => p.fileId === activeFile.id);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.kt')) return <span className="text-purple-400 font-bold text-xs">K</span>;
    if (fileName.endsWith('.xml')) return <span className="text-amber-400 font-bold text-xs">&lt;&gt;</span>;
    if (fileName.endsWith('.gradle.kts') || fileName.endsWith('.gradle')) return <span className="text-cyan-400 font-bold text-xs">G</span>;
    if (fileName.endsWith('.json')) return <span className="text-emerald-400 font-bold text-xs">&#123;&#125;</span>;
    return <FileText className="w-3.5 h-3.5 text-blue-400" />;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#2b2d30] overflow-hidden select-none">
      {/* File Tabs Bar */}
      <div className="h-9 bg-[#1e1f22] border-b border-[#393b40] flex items-center overflow-x-auto no-scrollbar px-1">
        {openFiles.map((file) => {
          const isActive = file.id === activeFile.id;
          return (
            <div
              key={file.id}
              onClick={() => onSelectTab(file.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-r border-[#393b40] cursor-pointer transition select-none ${
                isActive
                  ? 'bg-[#2b2d30] text-[#dfe1e5] border-t-2 border-t-[#3ddc84] font-medium'
                  : 'text-[#9da0a8] hover:bg-[#26282b] hover:text-[#dfe1e5]'
              }`}
            >
              {getFileIcon(file.name)}
              <span className="truncate max-w-[130px]">{file.name}</span>
              {file.isModified && <span className="w-1.5 h-1.5 rounded-full bg-[#3ddc84]" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className="hover:bg-[#393b40] rounded p-0.5 ml-1 text-[#9da0a8] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Editor Sub-toolbar (Search, Undo, Redo, Format, Breadcrumb) */}
      <div className="h-8 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-3 text-xs text-[#9da0a8]">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-[#9da0a8] truncate">
          <span className="text-[#3ddc84] font-semibold">{activeFile.path.split('/')[0]}</span>
          {activeFile.path.split('/').slice(1).map((seg, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-[#7a7e85]" />
              <span className={idx === activeFile.path.split('/').length - 2 ? 'text-[#dfe1e5]' : ''}>{seg}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse">
          <button
            onClick={() => onSaveFile(activeFile.id)}
            title={isAr ? 'حفظ (Ctrl+S)' : 'Save (Ctrl+S)'}
            className="p-1 hover:text-white hover:bg-[#393b40] rounded"
          >
            <Save className="w-3.5 h-3.5 text-[#3ddc84]" />
          </button>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title={isAr ? 'تراجع' : 'Undo'}
            className="p-1 hover:text-white hover:bg-[#393b40] rounded disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title={isAr ? 'إعادة' : 'Redo'}
            className="p-1 hover:text-white hover:bg-[#393b40] rounded disabled:opacity-30"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            title={isAr ? 'بحث واستبدال (Ctrl+F)' : 'Find & Replace (Ctrl+F)'}
            className={`p-1 rounded ${showSearch ? 'bg-[#3ddc84]/20 text-[#3ddc84]' : 'hover:text-white hover:bg-[#393b40]'}`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowJumpModal(true)}
            className="text-[11px] font-mono px-1.5 py-0.5 hover:bg-[#393b40] rounded text-[#dfe1e5]"
            title={isAr ? 'انتقال إلى سطر' : 'Go to line'}
          >
            :{cursorPos.line}:{cursorPos.col}
          </button>
        </div>
      </div>

      {/* Find and Replace Expandable Bar */}
      {showSearch && (
        <div className="bg-[#1e1f22] border-b border-[#393b40] p-2 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#2b2d30] border border-[#393b40] rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-[#9da0a8]" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن...' : 'Find...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#dfe1e5] w-28 md:w-40 text-xs font-mono"
            />
            {searchQuery && (
              <span className="text-[10px] text-[#9da0a8] font-mono">
                {matchCount} {isAr ? 'تطابق' : 'matches'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-[#2b2d30] border border-[#393b40] rounded px-2 py-1">
            <input
              type="text"
              placeholder={isAr ? 'استبدال بـ...' : 'Replace with...'}
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#dfe1e5] w-28 md:w-40 text-xs font-mono"
            />
            <button
              onClick={handleReplaceAll}
              disabled={!searchQuery}
              className="text-[10px] bg-[#3ddc84] text-black font-semibold px-2 py-0.5 rounded hover:bg-[#35c977] disabled:opacity-40"
            >
              {isAr ? 'استبدال الكل' : 'Replace All'}
            </button>
          </div>

          <button
            onClick={() => setShowSearch(false)}
            className="p-1 text-[#9da0a8] hover:text-white ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Code Editor Body (Line Numbers + Textarea) */}
      <div className="flex-1 flex relative overflow-hidden bg-[#2b2d30]">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-11 md:w-13 bg-[#1e1f22] border-r border-[#393b40] select-none py-3 text-right pr-2 text-[#61646b] font-mono-code text-xs leading-6 overflow-hidden flex flex-col items-end"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const hasError = fileProblems.some((p) => p.line === lineNum);
            const isCurrent = cursorPos.line === lineNum;
            return (
              <div
                key={idx}
                className={`w-full flex items-center justify-end pr-1 text-[11px] ${
                  isCurrent ? 'text-[#dfe1e5] font-bold bg-[#2b2d30]' : ''
                } ${hasError ? 'text-red-400' : ''}`}
              >
                {hasError && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 inline-block" />}
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Editor */}
        <div className="flex-1 relative overflow-auto">
          <textarea
            ref={textareaRef}
            value={activeFile.content || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleSelectOrKeyUp}
            onClick={handleSelectOrKeyUp}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            className="w-full h-full bg-[#2b2d30] text-[#dfe1e5] font-mono-code text-xs leading-6 p-3 outline-none resize-none border-none whitespace-pre select-text tab-4 overflow-auto"
            style={{ tabSize: 4 }}
          />
        </div>
      </div>

      {/* Mobile Keyboard Shortcut Toolbar (Life saver for Android Phone coding!) */}
      <div className="h-10 bg-[#1e1f22] border-t border-[#393b40] flex items-center overflow-x-auto no-scrollbar px-2 space-x-1.5 rtl:space-x-reverse select-none">
        <button
          onClick={() => insertShortcut('    ')}
          className="px-2 py-1 bg-[#2b2d30] active:bg-[#3ddc84] active:text-black text-[#dfe1e5] border border-[#393b40] rounded font-mono text-xs font-semibold"
        >
          Tab
        </button>
        {['{', '}', '(', ')', '[', ']', '<', '>', '=', ';', ':', '"', '->', '::', 'val ', 'var ', 'fun ', 'class '].map(
          (char) => (
            <button
              key={char}
              onClick={() => insertShortcut(char)}
              className="px-2.5 py-1 bg-[#2b2d30] active:bg-[#3ddc84] active:text-black text-[#dfe1e5] hover:text-[#3ddc84] border border-[#393b40] rounded font-mono text-xs font-semibold shrink-0"
            >
              {char.trim()}
            </button>
          )
        )}
      </div>

      {/* Jump to Line Modal */}
      {showJumpModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-40">
          <div className="bg-[#1e1f22] border border-[#393b40] rounded-xl p-4 w-72 shadow-2xl">
            <h4 className="text-sm font-semibold text-white mb-2">
              {isAr ? 'الانتقال إلى سطر' : 'Go to Line'}
            </h4>
            <input
              type="number"
              placeholder={`1 - ${lines.length}`}
              value={jumpLine}
              onChange={(e) => setJumpLine(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToLine()}
              autoFocus
              className="w-full bg-[#2b2d30] border border-[#393b40] rounded-lg px-3 py-2 text-sm font-mono text-white outline-none focus:border-[#3ddc84] mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowJumpModal(false)}
                className="px-3 py-1.5 text-xs text-[#9da0a8] hover:text-white"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleJumpToLine}
                className="px-4 py-1.5 bg-[#3ddc84] text-black font-semibold text-xs rounded-lg hover:bg-[#35c977]"
              >
                {isAr ? 'انتقال' : 'Go'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
