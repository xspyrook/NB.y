import { Language } from '../types';

export interface Token {
  text: string;
  className: string;
}

const KOTLIN_KEYWORDS = new Set([
  'package', 'import', 'class', 'interface', 'object', 'fun', 'val', 'var',
  'override', 'private', 'protected', 'public', 'internal', 'abstract', 'final',
  'data', 'sealed', 'open', 'suspend', 'inline', 'tailrec', 'operator',
  'if', 'else', 'when', 'for', 'while', 'do', 'return', 'break', 'continue',
  'throw', 'try', 'catch', 'finally', 'this', 'super', 'null', 'true', 'false',
  'is', 'as', 'in', 'by', 'companion', 'constructor', 'init', 'get', 'set',
  'lateinit', 'const', 'typealias', 'enum'
]);

const KOTLIN_TYPES = new Set([
  'String', 'Int', 'Long', 'Boolean', 'Float', 'Double', 'Char', 'Byte', 'Short',
  'Any', 'Unit', 'Nothing', 'List', 'Map', 'Set', 'ArrayList', 'HashMap',
  'Bundle', 'ComponentActivity', 'Modifier', 'Color', 'Dp', 'Text', 'Icon', 'Button',
  'Column', 'Row', 'Box', 'Surface', 'MaterialTheme', 'Scaffold', 'TopAppBar',
  'Card', 'Spacer', 'State', 'MutableState', 'FloatingActionButton', 'Alignment',
  'Arrangement', 'FontWeight', 'ExperimentalMaterial3Api', 'Composable', 'Preview'
]);

export function highlightCode(code: string, language: Language = 'kotlin'): Token[][] {
  const lines = code.split('\n');
  return lines.map((line) => highlightLine(line, language));
}

function highlightLine(line: string, language: Language): Token[] {
  if (language === 'xml') {
    return highlightXmlLine(line);
  }
  return highlightKotlinLine(line);
}

function highlightKotlinLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Single line comments
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ text: line.slice(i), className: 'hl-comment' });
      break;
    }

    // Strings
    if (line[i] === '"') {
      let str = '"';
      i++;
      let escaped = false;
      while (i < line.length) {
        str += line[i];
        if (line[i] === '\\' && !escaped) {
          escaped = true;
        } else if (line[i] === '"' && !escaped) {
          i++;
          break;
        } else {
          escaped = false;
        }
        i++;
      }
      tokens.push({ text: str, className: 'hl-string' });
      continue;
    }

    // Annotations (@Composable, @Override)
    if (line[i] === '@') {
      let annot = '@';
      i++;
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
        annot += line[i];
        i++;
      }
      tokens.push({ text: annot, className: 'hl-annotation' });
      continue;
    }

    // Numbers
    if (/\d/.test(line[i])) {
      let num = '';
      while (i < line.length && /[0-9a-fA-FxX.Lfd]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ text: num, className: 'hl-number' });
      continue;
    }

    // Words (Keywords, Types, Identifiers)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      if (KOTLIN_KEYWORDS.has(word)) {
        tokens.push({ text: word, className: 'hl-keyword' });
      } else if (KOTLIN_TYPES.has(word) || /^[A-Z]/.test(word)) {
        tokens.push({ text: word, className: 'hl-type' });
      } else if (i < line.length && line[i] === '(') {
        tokens.push({ text: word, className: 'hl-function' });
      } else {
        tokens.push({ text: word, className: 'hl-variable' });
      }
      continue;
    }

    // Symbols and Whitespace
    tokens.push({ text: line[i], className: 'hl-punctuation' });
    i++;
  }

  return tokens;
}

function highlightXmlLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Comments <!-- -->
    if (line.slice(i, i + 4) === '<!--') {
      const endIdx = line.indexOf('-->', i);
      if (endIdx !== -1) {
        tokens.push({ text: line.slice(i, endIdx + 3), className: 'hl-comment' });
        i = endIdx + 3;
      } else {
        tokens.push({ text: line.slice(i), className: 'hl-comment' });
        break;
      }
      continue;
    }

    // Strings
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        str += line[i];
        i++;
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ text: str, className: 'hl-string' });
      continue;
    }

    // Tags <tag or </tag
    if (line[i] === '<') {
      let tag = '<';
      i++;
      if (line[i] === '/') {
        tag += '/';
        i++;
      }
      while (i < line.length && /[a-zA-Z0-9_:\-.]/.test(line[i])) {
        tag += line[i];
        i++;
      }
      tokens.push({ text: tag, className: 'hl-tag font-bold' });
      continue;
    }

    // Closing tag > or />
    if (line[i] === '>') {
      tokens.push({ text: '>', className: 'hl-tag font-bold' });
      i++;
      continue;
    }
    if (line[i] === '/' && line[i + 1] === '>') {
      tokens.push({ text: '/>', className: 'hl-tag font-bold' });
      i += 2;
      continue;
    }

    // Attributes (android:id, xmlns:android)
    if (/[a-zA-Z_:]/.test(line[i])) {
      let attr = '';
      while (i < line.length && /[a-zA-Z0-9_:.\-]/.test(line[i])) {
        attr += line[i];
        i++;
      }
      tokens.push({ text: attr, className: 'hl-attribute' });
      continue;
    }

    // Default
    tokens.push({ text: line[i], className: 'hl-punctuation' });
    i++;
  }

  return tokens;
}
