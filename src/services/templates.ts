import { AndroidProject, FileItem, UIType } from '../types';

export function createDefaultComposeProject(
  name = 'Android Studio Mobile IDE',
  packageName = 'com.my.androidstudio',
  minSdk = 26,
  targetSdk = 35
): AndroidProject {
  const id = `proj_${Date.now()}`;

  const files: FileItem[] = [
    {
      id: 'f_settings_gradle',
      name: 'settings.gradle.kts',
      path: 'settings.gradle.kts',
      type: 'file',
      language: 'gradle',
      content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${name}"
include(":app")
`,
    },
    {
      id: 'f_root_build_gradle',
      name: 'build.gradle.kts',
      path: 'build.gradle.kts',
      type: 'file',
      language: 'gradle',
      content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
    },
    {
      id: 'f_gradle_properties',
      name: 'gradle.properties',
      path: 'gradle.properties',
      type: 'file',
      language: 'gradle',
      content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`,
    },
    {
      id: 'd_app',
      name: 'app',
      path: 'app',
      type: 'directory',
      children: [
        {
          id: 'f_app_build_gradle',
          name: 'build.gradle.kts',
          path: 'app/build.gradle.kts',
          type: 'file',
          language: 'gradle',
          content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "${packageName}"
    compileSdk = ${targetSdk}

    defaultConfig {
        applicationId = "${packageName}"
        minSdk = ${minSdk}
        targetSdk = ${targetSdk}
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
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
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
`,
        },
        {
          id: 'd_src',
          name: 'src',
          path: 'app/src',
          type: 'directory',
          children: [
            {
              id: 'd_main',
              name: 'main',
              path: 'app/src/main',
              type: 'directory',
              children: [
                {
                  id: 'f_manifest',
                  name: 'AndroidManifest.xml',
                  path: 'app/src/main/AndroidManifest.xml',
                  type: 'file',
                  language: 'xml',
                  content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AndroidStudioMobile">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.AndroidStudioMobile">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
                },
                {
                  id: 'd_kotlin',
                  name: 'kotlin',
                  path: 'app/src/main/kotlin',
                  type: 'directory',
                  children: [
                    {
                      id: 'd_package',
                      name: packageName.replace(/\./g, '/'),
                      path: `app/src/main/kotlin/${packageName.replace(/\./g, '/')}`,
                      type: 'directory',
                      children: [
                        {
                          id: 'f_main_activity',
                          name: 'MainActivity.kt',
                          path: `app/src/main/kotlin/${packageName.replace(/\./g, '/')}/MainActivity.kt`,
                          type: 'file',
                          language: 'kotlin',
                          content: `package ${packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    primary = Color(0xFF3DDC84),
                    background = Color(0xFF1E1F22),
                    surface = Color(0xFF2B2D30),
                    onPrimary = Color.Black
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AndroidStudioMobileScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AndroidStudioMobileScreen() {
    var count by remember { mutableIntStateOf(0) }
    var appStatus by remember { mutableStateOf("جاهز للتطوير على الهاتف") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Code,
                            contentDescription = "Code",
                            tint = Color(0xFF3DDC84),
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "Android Studio Mobile",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2B2D30),
                    titleContentColor = Color.White
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { count++ },
                containerColor = Color(0xFF3DDC84),
                contentColor = Color.Black,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2B2D30)),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "مرحباً بك في أندرويد ستوديو موبايل",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "تم إنشاء وتطوير هذا التطبيق مباشرة من الهاتف الذكي!",
                        fontSize = 14.sp,
                        color = Color(0xFF9DA0A8)
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    Text(
                        text = "عداد النقرات: $count",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF3DDC84)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    appStatus = "تم تشغيل المهمة بنجاح في: \${System.currentTimeMillis()}"
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF3DDC84),
                    contentColor = Color.Black
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().height(50.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                Text("تشغيل الإجراء التجريبي", fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = appStatus,
                fontSize = 13.sp,
                color = Color(0xFF7A7E85)
            )
        }
    }
}
`,
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'd_res',
                  name: 'res',
                  path: 'app/src/main/res',
                  type: 'directory',
                  children: [
                    {
                      id: 'd_layout',
                      name: 'layout',
                      path: 'app/src/main/res/layout',
                      type: 'directory',
                      children: [
                        {
                          id: 'f_activity_main_xml',
                          name: 'activity_main.xml',
                          path: 'app/src/main/res/layout/activity_main.xml',
                          type: 'file',
                          language: 'xml',
                          content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp"
    android:background="#1E1F22">

    <TextView
        android:id="@+id/tvTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/welcome_message"
        android:textColor="#3DDC84"
        android:textSize="22sp"
        android:textStyle="bold"
        android:gravity="center" />

    <TextView
        android:id="@+id/tvSubtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:text="بيئة تطوير حقيقية لتطبيقات أندرويد من الهاتف"
        android:textColor="#9DA0A8"
        android:textSize="15sp"
        android:gravity="center" />

    <Button
        android:id="@+id/btnAction"
        android:layout_width="match_parent"
        android:layout_height="54dp"
        android:layout_marginTop="32dp"
        android:backgroundTint="#3DDC84"
        android:textColor="#000000"
        android:text="اضغط هنا للتفاعل"
        android:textSize="16sp"
        android:textStyle="bold" />

    <TextView
        android:id="@+id/tvCounter"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="20dp"
        android:text="النقرات: 0"
        android:textColor="#DFE1E5"
        android:textSize="18sp" />

</LinearLayout>
`,
                        },
                      ],
                    },
                    {
                      id: 'd_values',
                      name: 'values',
                      path: 'app/src/main/res/values',
                      type: 'directory',
                      children: [
                        {
                          id: 'f_strings_xml',
                          name: 'strings.xml',
                          path: 'app/src/main/res/values/strings.xml',
                          type: 'file',
                          language: 'xml',
                          content: `<resources>
    <string name="app_name">${name}</string>
    <string name="welcome_message">مرحباً بك في Android Studio Mobile</string>
</resources>
`,
                        },
                        {
                          id: 'f_colors_xml',
                          name: 'colors.xml',
                          path: 'app/src/main/res/values/colors.xml',
                          type: 'file',
                          language: 'xml',
                          content: `<resources>
    <color name="android_green">#3DDC84</color>
    <color name="bg_dark">#1E1F22</color>
    <color name="surface_dark">#2B2D30</color>
    <color name="white">#FFFFFFFF</color>
    <color name="black">#FF000000</color>
</resources>
`,
                        },
                        {
                          id: 'f_themes_xml',
                          name: 'themes.xml',
                          path: 'app/src/main/res/values/themes.xml',
                          type: 'file',
                          language: 'xml',
                          content: `<resources>
    <style name="Theme.AndroidStudioMobile" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#2B2D30</item>
        <item name="android:navigationBarColor">#1E1F22</item>
    </style>
</resources>
`,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'd_test',
              name: 'test',
              path: 'app/src/test',
              type: 'directory',
              children: [
                {
                  id: 'f_unit_test',
                  name: 'ExampleUnitTest.kt',
                  path: 'app/src/test/kotlin/ExampleUnitTest.kt',
                  type: 'file',
                  language: 'kotlin',
                  content: `package ${packageName}

import org.junit.Test
import org.junit.Assert.*

/**
 * Example local unit test, which will execute on the development machine (host).
 * See [testing documentation](http://d.android.com/tools/testing).
 */
class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun packageName_isValid() {
        val pkg = "${packageName}"
        assertTrue(pkg.contains("."))
        assertFalse(pkg.contains(" "))
    }
}
`,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  return {
    id,
    name,
    packageName,
    minSdk,
    targetSdk,
    versionCode: 1,
    versionName: '1.0.0',
    uiType: 'compose',
    language: 'kotlin',
    files,
    activeFileId: 'f_main_activity',
    openFileIds: ['f_main_activity', 'f_manifest', 'f_app_build_gradle'],
    createdAt: Date.now(),
    lastModified: Date.now(),
    buildVariant: 'debug',
  };
}

export function createDefaultXmlProject(
  name = 'Android XML App',
  packageName = 'com.my.androidstudio.xml',
  minSdk = 26,
  targetSdk = 35
): AndroidProject {
  const proj = createDefaultComposeProject(name, packageName, minSdk, targetSdk);
  proj.uiType = 'xml';
  proj.activeFileId = 'f_activity_main_xml';
  proj.openFileIds = ['f_activity_main_xml', 'f_main_activity', 'f_manifest'];
  return proj;
}

// Flat file list helper
export function flattenFiles(items: FileItem[]): FileItem[] {
  const result: FileItem[] = [];
  function traverse(list: FileItem[]) {
    for (const item of list) {
      result.push(item);
      if (item.children) {
        traverse(item.children);
      }
    }
  }
  traverse(items);
  return result;
}

// Find file by ID
export function findFileById(items: FileItem[], id: string): FileItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findFileById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Find file by Path
export function findFileByPath(items: FileItem[], path: string): FileItem | null {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findFileByPath(item.children, path);
      if (found) return found;
    }
  }
  return null;
}

// Update file content
export function updateFileContentInTree(items: FileItem[], fileId: string, newContent: string): FileItem[] {
  return items.map((item) => {
    if (item.id === fileId) {
      return { ...item, content: newContent, isModified: true };
    }
    if (item.children) {
      return {
        ...item,
        children: updateFileContentInTree(item.children, fileId, newContent),
      };
    }
    return item;
  });
}
