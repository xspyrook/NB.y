import { FileItem, ProblemItem } from '../types';

export function lintFile(file: FileItem): ProblemItem[] {
  const problems: ProblemItem[] = [];
  if (!file.content) return problems;

  const lines = file.content.split('\n');

  if (file.language === 'kotlin') {
    let braceCount = 0;
    let parenCount = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check package statement on top
      if (lineNum === 1 && !trimmed.startsWith('package ') && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
        problems.push({
          id: `prob_${file.id}_${lineNum}`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          col: 1,
          severity: 'warning',
          message: 'ملف Kotlin ينبغي أن يبدأ بتصريح الحزمة (package declaration)',
          rule: 'kotlin-package-header',
        });
      }

      // Check unclosed quotes on single line
      const doubleQuotes = (line.match(/"/g) || []).length;
      if (doubleQuotes % 2 !== 0 && !line.includes('"""')) {
        problems.push({
          id: `prob_quote_${file.id}_${lineNum}`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          col: line.lastIndexOf('"') + 1,
          severity: 'error',
          message: 'نص غير مغلق (Unclosed string literal)',
          rule: 'unclosed-string',
        });
      }

      // Check braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
    });

    if (braceCount !== 0) {
      problems.push({
        id: `prob_brace_${file.id}`,
        fileId: file.id,
        filePath: file.path,
        line: lines.length,
        col: 1,
        severity: 'error',
        message: `أقواس معقوفة غير متطابقة { }: الفارق ${braceCount > 0 ? '+' : ''}${braceCount}`,
        rule: 'mismatched-braces',
      });
    }

    if (parenCount !== 0) {
      problems.push({
        id: `prob_paren_${file.id}`,
        fileId: file.id,
        filePath: file.path,
        line: lines.length,
        col: 1,
        severity: 'error',
        message: `أقواس دائرية غير متطابقة ( ): الفارق ${parenCount > 0 ? '+' : ''}${parenCount}`,
        rule: 'mismatched-parentheses',
      });
    }
  }

  if (file.language === 'xml') {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check if tag is opened without closing
      if (trimmed.startsWith('<') && !trimmed.startsWith('<!--') && !trimmed.startsWith('<?') && !trimmed.endsWith('>') && !trimmed.endsWith('/>')) {
        problems.push({
          id: `prob_xml_tag_${file.id}_${lineNum}`,
          fileId: file.id,
          filePath: file.path,
          line: lineNum,
          col: 1,
          severity: 'warning',
          message: 'وسم XML قد يكون غير مكتمل على هذا السطر',
          rule: 'incomplete-xml-tag',
        });
      }
    });
  }

  return problems;
}
