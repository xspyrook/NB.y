import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Code2,
  Bug,
  HelpCircle,
  Check,
  Copy,
  RefreshCw,
  Wand2,
  FileCheck,
} from 'lucide-react';
import { FileItem } from '../../types';

interface AiAssistantPanelProps {
  activeFile: FileItem | null;
  buildLogs: string;
  onApplyCode: (newCode: string) => void;
  lang: 'ar' | 'en';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedCode?: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  activeFile,
  buildLogs,
  onApplyCode,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isAr
        ? 'أهلاً بك! أنا مساعد Android Studio الذكي للبرمجة. يمكنني شرح كود Kotlin، إنشاء واجهات Jetpack Compose أو XML، وإصلاح أخطاء البناء وGradle فوراً.'
        : 'Welcome! I am your Android Studio Mobile AI Assistant. I can explain Kotlin code, generate Compose or XML UI, and fix Gradle build errors directly.',
    },
  ]);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  // Quick Action Buttons
  const triggerAction = async (actionType: 'explain' | 'fix-build-error' | 'generate-compose' | 'custom', customPrompt?: string) => {
    setIsLoading(true);

    let userText = customPrompt || prompt;
    if (actionType === 'explain') {
      userText = isAr ? 'اشرح الكود الحالي في هذا الملف' : 'Explain the current file code';
    } else if (actionType === 'fix-build-error') {
      userText = isAr ? 'حلل أخطاء البناء واقترح الإصلاح' : 'Diagnose Gradle build errors and suggest fix';
    } else if (actionType === 'generate-compose') {
      userText = isAr
        ? 'أنشئ واجهة Jetpack Compose جميلة مع بطاقات وأزرار تفاعلية'
        : 'Generate a modern Jetpack Compose screen with Material 3 cards';
    }

    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setPrompt('');

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType === 'generate-compose' ? 'generate' : actionType,
          prompt: userText,
          code: activeFile?.content || '',
          language: activeFile?.language || 'kotlin',
          fileName: activeFile?.name || 'MainActivity.kt',
          buildLogs,
        }),
      });

      const data = await response.json();
      const outputText = data.text || data.suggestion || 'حدث خطأ في استلام الرد.';

      // Extract code block if any
      let extractedCode: string | undefined = undefined;
      const codeMatch = outputText.match(/```(?:kotlin|xml|json|gradle)?\n([\s\S]*?)```/);
      if (codeMatch) {
        extractedCode = codeMatch[1].trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: outputText,
          suggestedCode: extractedCode,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAr
            ? `تعذر الاتصال بالخادم: ${err?.message || 'خطأ في الشبكة'}.`
            : `Failed to connect: ${err?.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (code: string, msgIdx: number) => {
    onApplyCode(code);
    setAppliedIndex(msgIdx);
    setTimeout(() => setAppliedIndex(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{isAr ? 'مساعد الذكاء الاصطناعي (Gemini)' : 'AI Coding Assistant'}</span>
        </div>
        <span className="text-[10px] font-mono text-[#9da0a8] bg-[#1e1f22] px-2 py-0.5 rounded">
          gemini-3.8-flash
        </span>
      </div>

      {/* Quick Action Pills */}
      <div className="p-2 border-b border-[#393b40] flex flex-wrap gap-1.5 bg-[#232428]">
        <button
          onClick={() => triggerAction('explain')}
          disabled={isLoading || !activeFile}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#2b2d30] hover:bg-purple-900/30 hover:border-purple-500/50 border border-[#393b40] rounded-full text-[11px] text-[#dfe1e5] transition disabled:opacity-40"
        >
          <HelpCircle className="w-3 h-3 text-purple-400" />
          <span>{isAr ? 'اشرح هذا الكود' : 'Explain Code'}</span>
        </button>

        <button
          onClick={() => triggerAction('fix-build-error')}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#2b2d30] hover:bg-red-900/30 hover:border-red-500/50 border border-[#393b40] rounded-full text-[11px] text-[#dfe1e5] transition disabled:opacity-40"
        >
          <Bug className="w-3 h-3 text-red-400" />
          <span>{isAr ? 'إصلاح أخطاء البناء' : 'Fix Build Errors'}</span>
        </button>

        <button
          onClick={() => triggerAction('generate-compose')}
          disabled={isLoading}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#2b2d30] hover:bg-[#3ddc84]/20 hover:border-[#3ddc84]/50 border border-[#393b40] rounded-full text-[11px] text-[#dfe1e5] transition disabled:opacity-40"
        >
          <Wand2 className="w-3 h-3 text-[#3ddc84]" />
          <span>{isAr ? 'توليد واجهة Compose' : 'Generate Compose'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl text-xs leading-relaxed select-text ${
              msg.role === 'user'
                ? 'bg-[#3ddc84]/15 border border-[#3ddc84]/30 text-white ml-6 rtl:ml-0 rtl:mr-6'
                : 'bg-[#2b2d30] border border-[#393b40] text-[#dfe1e5]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1 text-[11px]">
              {msg.role === 'user' ? (
                <span className="text-[#3ddc84]">{isAr ? 'أنت' : 'You'}</span>
              ) : (
                <span className="text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Android Studio AI
                </span>
              )}
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>

            {/* If suggested code block is available, offer One-Click Apply */}
            {msg.suggestedCode && (
              <div className="mt-3 pt-2 border-t border-[#393b40] flex items-center justify-between">
                <span className="text-[10px] text-[#9da0a8] font-mono">
                  {isAr ? 'كود مقترح للتطبيق' : 'Suggested Code'}
                </span>
                <button
                  onClick={() => handleApply(msg.suggestedCode!, idx)}
                  className="px-3 py-1 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow"
                >
                  {appliedIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تم التطبيق بنجاح!' : 'Applied!'}</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تطبيق على الملف المفتوح' : 'Apply to Active File'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="p-3 bg-[#2b2d30] border border-[#393b40] rounded-xl text-xs flex items-center gap-2 text-purple-300">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>{isAr ? 'جاري التفكير وتحليل الكود...' : 'Analyzing and generating code...'}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-2 border-t border-[#393b40] bg-[#26282b] flex items-center gap-1.5">
        <input
          type="text"
          placeholder={
            isAr
              ? 'اكتب سؤالك أو اطلب كود Kotlin أو XML...'
              : 'Ask a question or request Kotlin/XML code...'
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading && prompt.trim()) {
              triggerAction('custom', prompt);
            }
          }}
          className="flex-1 bg-[#1e1f22] border border-[#393b40] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-400 font-sans"
        />
        <button
          onClick={() => triggerAction('custom', prompt)}
          disabled={isLoading || !prompt.trim()}
          className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
