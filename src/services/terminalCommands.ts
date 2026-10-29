import { AndroidProject } from '../types';
import { flattenFiles, findFileByPath } from './templates';

export interface CommandResult {
  output: string;
  isError?: boolean;
  action?: 'build' | 'clear' | 'test' | 'sync';
}

export function executeTerminalCommand(cmd: string, project: AndroidProject): CommandResult {
  const trimmed = cmd.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const arg1 = parts[1];

  if (!trimmed) {
    return { output: '' };
  }

  if (command === 'clear') {
    return { output: '', action: 'clear' };
  }

  if (command === 'help') {
    return {
      output: `Android Studio Mobile IDE Terminal (Shell v2.4):
الأوامر المتاحة:
  ./gradlew assembleDebug    - بناء تطبيق Android بصيغة Debug APK
  ./gradlew assembleRelease  - بناء تطبيق Android بصيغة Release APK
  ./gradlew test             - تشغيل اختبارات الوحدة (JUnit Tests)
  ./gradlew sync             - مزامنة إعدادات Gradle والمستودعات
  ls, dir                    - استعراض ملفات المشروع الحالية
  tree                       - عرض الهيكل الشجري للمشروع
  cat <filepath>             - قراءة محتوى ملف معين
  sdkmanager --list          - عرض إصدارات Android SDK المثبتة
  git status                 - فحص حالة التعديلات في المشروع
  clear                      - مسح شاشة الطرفية
  help                       - عرض قائمة التعليمات والمساعدة`,
    };
  }

  if (command === './gradlew' || command === 'gradlew' || command === 'gradle') {
    if (arg1 === 'assembleDebug' || arg1 === 'build') {
      return {
        output: `> Task :app:assembleDebug\nجاري تشغيل محرك البناء وتجميع Debug APK...`,
        action: 'build',
      };
    }
    if (arg1 === 'assembleRelease') {
      return {
        output: `> Task :app:assembleRelease\nجاري تشغيل محرك البناء وتجميع Release APK...`,
        action: 'build',
      };
    }
    if (arg1 === 'test') {
      return {
        output: `> Task :app:testDebugUnitTest\nجاري تشغيل اختبارات الوحدة في ExampleUnitTest.kt...`,
        action: 'test',
      };
    }
    if (arg1 === 'sync') {
      return {
        output: `Starting Gradle Sync...\nRepositories: google(), mavenCentral()\nDependencies synced successfully.`,
        action: 'sync',
      };
    }
    return {
      output: `مهام Gradle المتاحة: assembleDebug, assembleRelease, test, sync, clean`,
    };
  }

  if (command === 'ls' || command === 'dir') {
    const flat = flattenFiles(project.files);
    const filesList = flat.map((f) => `${f.type === 'directory' ? '📁' : '📄'} ${f.path}`).join('\n');
    return { output: filesList };
  }

  if (command === 'tree') {
    const lines: string[] = [`${project.name}/`];
    function printBranch(items: any[], indent: string) {
      items.forEach((item, idx) => {
        const isLast = idx === items.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        lines.push(`${indent}${prefix}${item.name}${item.type === 'directory' ? '/' : ''}`);
        if (item.children) {
          printBranch(item.children, indent + (isLast ? '    ' : '│   '));
        }
      });
    }
    printBranch(project.files, '');
    return { output: lines.join('\n') };
  }

  if (command === 'cat') {
    if (!arg1) {
      return { output: 'الرجاء تحديد مسار الملف: cat <file_path>', isError: true };
    }
    const file = findFileByPath(project.files, arg1) || flattenFiles(project.files).find((f) => f.name === arg1);
    if (!file) {
      return { output: `الملف غير موجود: ${arg1}`, isError: true };
    }
    return { output: file.content || '(ملف فارغ)' };
  }

  if (command === 'sdkmanager') {
    return {
      output: `Android SDK Tools & Platforms:
Installed Platforms:
  - platforms;android-35 (Android 15)
  - platforms;android-34 (Android 14)
  - platforms;android-26 (Android 8.0 Oreo - Min SDK)
Build-Tools:
  - build-tools;35.0.0
  - build-tools;34.0.0
Compilers:
  - kotlinc 2.1.0
  - d8/r8 dexer 8.5.35
  - aapt2 8.8.0-12006047`,
    };
  }

  if (command === 'git') {
    if (arg1 === 'status') {
      const modified = flattenFiles(project.files).filter((f) => f.isModified);
      if (modified.length === 0) {
        return { output: 'On branch main\nYour branch is up to date with origin/main.\nNothing to commit, working tree clean.' };
      }
      return {
        output: `On branch main\nChanges not staged for commit:\n${modified.map((f) => `  modified:   ${f.path}`).join('\n')}`,
      };
    }
    return { output: `Git commands supported: git status` };
  }

  return {
    output: `الأمر غير معروف: '${cmd}'. اكتب 'help' لعرض الأوامر المتاحة.`,
    isError: true,
  };
}
