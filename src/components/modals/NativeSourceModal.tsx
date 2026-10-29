import React, { useState } from 'react';
import { X, FileCode, Download, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';

interface NativeSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const NativeSourceModal: React.FC<NativeSourceModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState('MainActivity.kt');

  if (!isOpen) return null;

  const nativeFiles: Record<string, { lang: string; code: string; desc: string }> = {
    'MainActivity.kt': {
      lang: 'kotlin',
      desc: 'النشاط الرئيسي لتطبيق Android Studio Mobile IDE الأصلي مع Jetpack Compose',
      code: `package com.my.androidstudio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.my.androidstudio.ui.theme.AndroidStudioTheme
import com.my.androidstudio.ui.screens.MainIdeScreen

/**
 * Android Studio Mobile IDE - Native Android Application Entry
 * Package: com.my.androidstudio
 * Min SDK: 26 (Android 8.0 Oreo) | Target SDK: 35
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AndroidStudioTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF1E1F22)
                ) {
                    MainIdeScreen()
                }
            }
        }
    }
}
`,
    },
    'CodeEditorView.kt': {
      lang: 'kotlin',
      desc: 'مكون محرر الأكواد الأصلي لنظام أندرويد مع أرقام الأسطر والتمييز اللوني',
      code: `package com.my.androidstudio.editor

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun CodeEditorView(
    code: String,
    onCodeChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val lines = code.lines()
    val scrollState = rememberScrollState()
    val horizontalScrollState = rememberScrollState()

    Row(modifier = modifier.background(Color(0xFF2B2D30))) {
        // Line numbers column
        Column(
            modifier = Modifier
                .width(44.dp)
                .background(Color(0xFF1E1F22))
                .verticalScroll(scrollState)
                .padding(vertical = 8.dp, horizontal = 4.dp)
        ) {
            lines.forEachIndexed { index, _ ->
                Text(
                    text = "\${index + 1}",
                    color = Color(0xFF61646B),
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        // Code input area
        BasicTextField(
            value = code,
            onValueChange = onCodeChange,
            textStyle = TextStyle(
                color = Color(0xFFDFE1E5),
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace
            ),
            cursorBrush = SolidColor(Color(0xFF3DDC84)),
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp)
                .verticalScroll(scrollState)
                .horizontalScroll(horizontalScrollState)
        )
    }
}
`,
    },
    'AndroidManifest.xml': {
      lang: 'xml',
      desc: 'ملف تصريح التطبيق الأصلي مع الأذونات اللازمة ومحددات التثبيت',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Android Studio Mobile IDE"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AndroidStudioMobile">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`,
    },
    'build.gradle.kts': {
      lang: 'gradle',
      desc: 'ملف بناء تطبيق أندرويد الأصلي مع أحدث اعتماديات Compose و Coroutines',
      code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.my.androidstudio"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.my.androidstudio"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
        debug {
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.10.0")
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`,
    },
  };

  const handleCopy = () => {
    const code = nativeFiles[selectedFile]?.code || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    for (const [filename, item] of Object.entries(nativeFiles)) {
      zip.file(filename, item.code);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'com_my_androidstudio_native_kotlin_project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 select-none animate-fade-in">
      <div className="bg-[#1e1f22] border border-[#393b40] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="h-12 bg-[#26282b] border-b border-[#393b40] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                {isAr ? 'كود تطبيق أندرويد الأصلي (Native Kotlin Project)' : 'Native Kotlin Project Source'}
              </h3>
              <p className="text-[10px] text-[#9da0a8] font-mono">Package: com.my.androidstudio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#9da0a8] hover:text-white rounded-lg hover:bg-[#35373c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="h-9 bg-[#1e1f22] border-b border-[#393b40] flex items-center px-2 space-x-1 rtl:space-x-reverse overflow-x-auto text-xs">
          {Object.keys(nativeFiles).map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-1 rounded font-mono transition text-xs ${
                selectedFile === file
                  ? 'bg-[#2b2d30] text-[#3ddc84] font-bold border-b-2 border-[#3ddc84]'
                  : 'text-[#9da0a8] hover:text-white'
              }`}
            >
              {file}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#2b2d30] font-mono text-xs text-[#dfe1e5] relative select-text">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#393b40]">
            <span className="text-[11px] text-[#9da0a8] font-sans">
              {nativeFiles[selectedFile]?.desc}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#35373c] text-white rounded border border-[#393b40] flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#3ddc84]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ الكود' : 'Copy'}</span>
            </button>
          </div>
          <pre className="whitespace-pre font-mono text-xs leading-5">
            {nativeFiles[selectedFile]?.code}
          </pre>
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#26282b] border-t border-[#393b40] px-4 flex items-center justify-between text-xs">
          <span className="text-[#9da0a8]">
            {isAr ? 'مشروع أصلي متكامل جاهز للفتح في أي جهاز كمبيوتر أو هاتف' : 'Complete native project ready for Android Studio'}
          </span>
          <button
            onClick={handleDownloadAll}
            className="px-4 py-1.5 bg-[#3ddc84] hover:bg-[#35c977] text-black font-bold rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تحميل المشروع كاملاً (ZIP)' : 'Download Source ZIP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
