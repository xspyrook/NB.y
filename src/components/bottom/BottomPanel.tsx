import React, { useState, useRef, useEffect } from 'react';
import {
  Hammer,
  Terminal as TerminalIcon,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import { BuildLogItem, ProblemItem, LogcatMessage, AndroidProject } from '../../types';
import { executeTerminalCommand } from '../../services/terminalCommands';

interface BottomPanelProps {
  logs: BuildLogItem[];
  problems: ProblemItem[];
  logcat: LogcatMessage[];
  project: AndroidProject;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClearLogs: () => void;
  onClearLogcat: () => void;
  onSelectProblemFile: (fileId: string, line: number) => void;
  onRunBuild: () => void;
  lang: 'ar' | 'en';
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  logs,
  problems,
  logcat,
  project,
  isOpen,
  onToggleOpen,
  onClearLogs,
  onClearLogcat,
  onSelectProblemFile,
  onRunBuild,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'build' | 'terminal' | 'problems' | 'logcat' | 'tests'>('build');
  const [isExpanded, setIsExpanded] = useState(false);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd?: string; output: string; isError?: boolean }>>([
    {
      output: `Android Studio Mobile IDE Terminal (Gradle & SDK Shell)\nType 'help' for available commands or './gradlew assembleDebug' to build.`,
    },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Logcat filter
  const [logcatFilter, setLogcatFilter] = useState('');
  const [logcatLevel, setLogcatLevel] = useState<string>('ALL');

  // Test suite execution state
  const [testResults, setTestResults] = useState<{ running: boolean; passed: number; failed: number; tests: Array<{ name: string; time: string; passed: boolean }> } | null>(null);

  // Scroll terminal to bottom
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, activeTab]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setCmdHistoryList((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    const result = executeTerminalCommand(cmd, project);

    if (result.action === 'clear') {
      setTerminalHistory([]);
    } else {
      setTerminalHistory((prev) => [...prev, { cmd, output: result.output, isError: result.isError }]);
      if (result.action === 'build') {
        onRunBuild();
      } else if (result.action === 'test') {
        runUnitTests();
      }
    }

    setTerminalInput('');
  };

  const runUnitTests = () => {
    setTestResults({ running: true, passed: 0, failed: 0, tests: [] });
    setTimeout(() => {
      setTestResults({
        running: false,
        passed: 2,
        failed: 0,
        tests: [
          { name: 'ExampleUnitTest.addition_isCorrect()', time: '12ms', passed: true },
          { name: 'ExampleUnitTest.packageName_isValid()', time: '8ms', passed: true },
        ],
      });
    }, 800);
  };

  if (!isOpen) return null;

  const errorCount = problems.filter((p) => p.severity === 'error').length;
  const warningCount = problems.filter((p) => p.severity === 'warning').length;

  return (
    <div
      className={`bg-[#1e1f22] border-t border-[#393b40] flex flex-col z-20 transition-all select-none ${
        isExpanded ? 'h-80 md:h-96' : 'h-48 md:h-60'
      }`}
    >
      {/* Tab Navigation Header */}
      <div className="h-9 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-2 text-xs">
        <div className="flex items-center space-x-1 rtl:space-x-reverse overflow-x-auto no-scrollbar">
          {/* Build Tab */}
          <button
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition ${
              activeTab === 'build'
                ? 'bg-[#1e1f22] text-[#3ddc84] border-b-2 border-[#3ddc84] font-bold'
                : 'text-[#9da0a8] hover:text-white'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-[#3ddc84]" />
            <span>{isAr ? 'سجل البناء (Build)' : 'Build'}</span>
          </button>

          {/* Terminal Tab */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition ${
              activeTab === 'terminal'
                ? 'bg-[#1e1f22] text-[#3ddc84] border-b-2 border-[#3ddc84] font-bold'
                : 'text-[#9da0a8] hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'الطرفية (Terminal)' : 'Terminal'}</span>
          </button>

          {/* Problems Tab */}
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition ${
              activeTab === 'problems'
                ? 'bg-[#1e1f22] text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'text-[#9da0a8] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'المشاكل (Problems)' : 'Problems'}</span>
            {(errorCount > 0 || warningCount > 0) && (
              <span className="text-[10px] px-1.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                {errorCount + warningCount}
              </span>
            )}
          </button>

          {/* Logcat Tab */}
          <button
            onClick={() => setActiveTab('logcat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition ${
              activeTab === 'logcat'
                ? 'bg-[#1e1f22] text-[#3ddc84] border-b-2 border-[#3ddc84] font-bold'
                : 'text-[#9da0a8] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{isAr ? 'سجل النظام (Logcat)' : 'Logcat'}</span>
          </button>

          {/* Unit Tests Tab */}
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t font-medium transition ${
              activeTab === 'tests'
                ? 'bg-[#1e1f22] text-emerald-400 border-b-2 border-emerald-400 font-bold'
                : 'text-[#9da0a8] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isAr ? 'الاختبارات (Tests)' : 'Tests'}</span>
          </button>
        </div>

        {/* Panel Controls (Maximize, Clear, Close) */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse text-[#9da0a8]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'تصغير' : 'تكبير'}
            className="p-1 hover:text-white rounded"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleOpen}
            title={isAr ? 'إغلاق اللوحة السفلية' : 'Close panel'}
            className="p-1 hover:text-white rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto bg-[#18191b] p-2 font-mono text-xs select-text">
        {/* 1. Build Tab */}
        {activeTab === 'build' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1 border-b border-[#2b2d30] text-[11px] text-[#9da0a8]">
              <span>Gradle Build Output & Diagnostics</span>
              <button
                onClick={onClearLogs}
                className="hover:text-white flex items-center gap-1"
                title={isAr ? 'مسح السجل' : 'Clear log'}
              >
                <Trash2 className="w-3 h-3" />
                <span>{isAr ? 'مسح' : 'Clear'}</span>
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-[#61646b] italic py-3 text-center">
                {isAr ? 'لا يوجد سجل بناء حالياً. اضغط على Run لتشغيل البناء.' : 'No build logs yet. Click Run to build.'}
              </p>
            ) : (
              logs.map((log) => {
                let color = 'text-[#dfe1e5]';
                if (log.level === 'task') color = 'text-cyan-400';
                if (log.level === 'success') color = 'text-[#3ddc84] font-bold';
                if (log.level === 'warn') color = 'text-amber-400';
                if (log.level === 'error') color = 'text-red-400 font-bold';

                return (
                  <div key={log.id} className="leading-5">
                    <span className="text-[#61646b] mr-2">[{log.timestamp}]</span>
                    <span className={color}>{log.message}</span>
                    {log.file && (
                      <span className="text-blue-400 underline ml-2 cursor-pointer">
                        {log.file}:{log.line}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. Terminal Tab */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full font-mono text-xs">
            <div className="flex-1 overflow-y-auto space-y-1">
              {terminalHistory.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  {item.cmd && (
                    <div className="flex items-center gap-1 text-[#3ddc84] font-semibold">
                      <span>$</span>
                      <span>{item.cmd}</span>
                    </div>
                  )}
                  <pre
                    className={`whitespace-pre-wrap font-mono text-[11px] ${
                      item.isError ? 'text-red-400' : 'text-[#dfe1e5]'
                    }`}
                  >
                    {item.output}
                  </pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="mt-2 pt-1 border-t border-[#2b2d30] flex items-center gap-2">
              <span className="text-[#3ddc84] font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="./gradlew assembleDebug, ls, tree, help..."
                className="flex-1 bg-transparent border-none outline-none text-[#dfe1e5] font-mono text-xs"
              />
            </form>
          </div>
        )}

        {/* 3. Problems Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-1">
            {problems.length === 0 ? (
              <div className="py-6 text-center text-[#3ddc84] flex flex-col items-center gap-1">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-xs font-semibold">{isAr ? 'لا توجد أخطاء في الكود أو ملفات Manifest' : 'No issues found'}</span>
              </div>
            ) : (
              problems.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProblemFile(p.fileId, p.line)}
                  className="flex items-start gap-2 p-1.5 hover:bg-[#26282b] rounded cursor-pointer transition border-b border-[#2b2d30]/60"
                >
                  {p.severity === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-xs ${p.severity === 'error' ? 'text-red-300 font-semibold' : 'text-amber-300'}`}>
                      {p.message}
                    </p>
                    <p className="text-[10px] text-[#9da0a8] font-mono">
                      {p.filePath} : {p.line}:{p.col}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Logcat Tab */}
        {activeTab === 'logcat' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-1 border-b border-[#2b2d30] gap-2">
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={logcatLevel}
                  onChange={(e) => setLogcatLevel(e.target.value)}
                  className="bg-[#2b2d30] border border-[#393b40] rounded px-2 py-0.5 text-xs text-[#dfe1e5]"
                >
                  <option value="ALL">All Levels</option>
                  <option value="I">Info</option>
                  <option value="D">Debug</option>
                  <option value="W">Warning</option>
                  <option value="E">Error</option>
                </select>
                <input
                  type="text"
                  placeholder="Filter tag or text..."
                  value={logcatFilter}
                  onChange={(e) => setLogcatFilter(e.target.value)}
                  className="bg-[#2b2d30] border border-[#393b40] rounded px-2 py-0.5 text-xs text-[#dfe1e5] w-36"
                />
              </div>

              <button onClick={onClearLogcat} className="text-[#9da0a8] hover:text-white flex items-center gap-1 text-xs">
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="space-y-0.5">
              {logcat.map((l) => (
                <div key={l.id} className="leading-4 flex items-start gap-1">
                  <span className="text-[#61646b] shrink-0">{l.timestamp}</span>
                  <span
                    className={`font-bold px-1 rounded text-[10px] ${
                      l.level === 'E'
                        ? 'bg-red-500/20 text-red-400'
                        : l.level === 'W'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {l.level}
                  </span>
                  <span className="text-[#3ddc84] font-semibold shrink-0">{l.tag}:</span>
                  <span className="text-[#dfe1e5]">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Unit Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#2b2d30]">
              <span className="font-semibold text-xs text-[#dfe1e5]">JUnit Local Unit Tests</span>
              <button
                onClick={runUnitTests}
                className="px-2.5 py-1 bg-[#3ddc84] text-black font-bold rounded text-xs flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isAr ? 'تشغيل الاختبارات' : 'Run Tests'}</span>
              </button>
            </div>

            {testResults ? (
              <div className="space-y-2">
                <div className="p-2 bg-[#26282b] rounded flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold">
                    Test Suites Passed: {testResults.passed} / {testResults.passed + testResults.failed}
                  </span>
                  <span className="text-[10px] text-[#9da0a8] font-mono">Finished in 20ms</span>
                </div>
                {testResults.tests.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 px-2 bg-[#1e1f22] rounded text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.name}</span>
                    </div>
                    <span className="text-[10px] text-[#9da0a8] font-mono">{t.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#61646b] italic py-3 text-center">
                {isAr ? "اضغط على 'تشغيل الاختبارات' لفحص دوال وحزم التطبيق." : "Click 'Run Tests' to execute unit tests."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
