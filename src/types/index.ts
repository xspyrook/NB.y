export type Language = 'kotlin' | 'xml' | 'gradle' | 'json' | 'markdown' | 'java';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: Language;
  children?: FileItem[];
  isModified?: boolean;
}

export type UIType = 'xml' | 'compose';

export interface AndroidProject {
  id: string;
  name: string;
  packageName: string;
  minSdk: number;
  targetSdk: number;
  versionCode: number;
  versionName: string;
  uiType: UIType;
  language: 'kotlin';
  files: FileItem[];
  activeFileId: string;
  openFileIds: string[];
  createdAt: number;
  lastModified: number;
  buildVariant: 'debug' | 'release';
}

export interface BuildLogItem {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error' | 'task';
  message: string;
  file?: string;
  line?: number;
}

export interface ApkItem {
  id: string;
  fileName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  sizeBytes: number;
  buildType: 'debug' | 'release';
  createdAt: number;
  blobUrl?: string;
  sha256?: string;
}

export interface ProblemItem {
  id: string;
  fileId: string;
  filePath: string;
  line: number;
  col: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule?: string;
}

export interface LogcatMessage {
  id: string;
  timestamp: string;
  level: 'V' | 'D' | 'I' | 'W' | 'E';
  tag: string;
  message: string;
}

export interface MavenDependency {
  groupId: string;
  artifactId: string;
  version: string;
  coordinate: string;
  gradleImplementation: string;
  description?: string;
  category?: string;
}
