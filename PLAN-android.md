# Plan: 旅帳 Android 包裝

**目標**：將現有 Capacitor iOS 設定複製到 Android，讓 app 可在 Android 裝置上執行。

**前提**：
- Capacitor CLI v7.6.4（本地安裝，`npx cap` 會自動使用）
- `@capacitor/core` v8.3.3 已安裝
- `@capacitor/android` 尚未安裝
- `android/` 資料夾不存在

---

## Phase 1 — 安裝 & 初始化

### 任務 1.1：安裝 `@capacitor/android`

```bash
npm install @capacitor/android@^8.3.3
```

版本必須與 `@capacitor/core`（`^8.3.3`）和 `@capacitor/ios`（`^8.3.3`）一致。

**驗證**：
```bash
grep "@capacitor/android" package.json
# 應出現 "^8.3.3"
```

---

### 任務 1.2：更新 `capacitor.config.ts`，加入 `android:` block

**檔案**：`capacitor.config.ts`

在 `ios: { ... }` 區塊後面加入 `android:` 區塊：

```ts
android: {
  appendUserAgent: "RyochoNative",
},
```

**說明**：
- `appendUserAgent: "RyochoNative"` 必須在 `android:` 裡獨立宣告，`ios:` 裡的設定不會自動套用到 Android
- `isNativeApp()` 在 `lib/capacitor.ts` 的主要判斷是 `navigator.userAgent.includes("RyochoNative")`，少了這行 Android WebView 會落到 fallback（`Capacitor.isNativePlatform()`），雖然 fallback 有效但 user-agent 路徑應一致
- Android 不需要 `contentInset`、`limitsNavigationsToAppBoundDomains` 這些 iOS 專有設定
- Android 不需要 `scheme: "ryocho"`（iOS scheme 是 WKWebView URL scheme；Android 的 scheme 在 AndroidManifest 設定）

**完整目標 config 結構**（僅供參考）：
```ts
const config: CapacitorConfig = {
  appId: "com.jasonchen.ryocho",
  appName: "旅帳",
  webDir: "out",
  ...(!useBundledWeb ? { server: { url: liveServerUrl, cleartext: false } } : {}),
  ios: {
    contentInset: "never",
    limitsNavigationsToAppBoundDomains: false,
    scheme: "ryocho",
    appendUserAgent: "RyochoNative",
  },
  android: {
    appendUserAgent: "RyochoNative",
  },
};
```

**驗證**：
```bash
npx tsc --noEmit
# 應無型別錯誤
```

---

### 任務 1.3：執行 `npx cap add android`

```bash
npx cap add android
```

這會：
- 在專案根目錄建立 `android/` 資料夾
- 複製 web assets（`out/`）到 Android project
- 安裝所有 Capacitor plugin 的 Android 原生部分

**驗證**：
```bash
ls android/app/src/main/AndroidManifest.xml
# 應存在
ls android/app/src/main/java/com/jasonchen/ryocho/
# 應有 MainActivity.kt
```

---

## Phase 2 — AndroidManifest.xml 設定

**檔案**：`android/app/src/main/AndroidManifest.xml`

`npx cap add android` 後此檔案存在，需手動新增以下內容。

### 任務 2.1：加入權限宣告

在 `<manifest>` 根層（`<application>` 標籤之前）加入：

```xml
<!-- 網路（通常自動加，確認是否已有） -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- 相機（AI 收據辨識拍照） -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- 相簿讀取 - Android 13+（API 33+） -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- 相簿讀取 - Android 12 以下（API <33），maxSdkVersion 避免在新版重複） -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />

<!-- 存檔 - Android 9 以下（API <29；API 29+ 使用 scoped storage，不需此權限） -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />

<!-- 推播通知 - Android 13+（API 33+） -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**說明**：
- `READ_MEDIA_IMAGES` + `READ_EXTERNAL_STORAGE maxSdkVersion=32` 是標準向下相容寫法，覆蓋 Android 12 以下及 13+ 兩種情況
- `@capacitor/local-notifications` 需要 `POST_NOTIFICATIONS`（Android 13+）
- `@capacitor/filesystem`（匯出圖片）在 Android 29+ 使用 scoped storage，不需要 `WRITE_EXTERNAL_STORAGE`

### 任務 2.2：加入 Deep Link intent-filter（`ryocho://` scheme）

在 `<activity>` 標籤內，找到或新增一個 `<intent-filter>`，加入 URL scheme：

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="ryocho" />
</intent-filter>
```

**說明**：
- 對應 iOS 的 `CFBundleURLSchemes: ["ryocho"]`
- Google OAuth PKCE 登入後會 redirect 到 `ryocho://auth/callback`，Android 需要這個 filter 才能接住
- 所有 deep link 路由邏輯在 `components/layout/deep-link-handler.tsx`（TypeScript 端），不需改 Kotlin

**驗證**：
```bash
grep -A5 "ryocho" android/app/src/main/AndroidManifest.xml
# 應看到 intent-filter 內容
grep "CAMERA\|READ_MEDIA\|POST_NOTIFICATIONS" android/app/src/main/AndroidManifest.xml
# 應看到所有權限
```

---

## Phase 3 — App Icon 設定

### 任務 3.1：確認現有 icon 資源

```bash
ls android/app/src/main/res/
# 應有 mipmap-* 資料夾（hdpi/mdpi/xhdpi/xxhdpi/xxxhdpi）
```

`npx cap add android` 預設放的是 Capacitor 預設圖示。需換成旅帳的圖示。

### 任務 3.2：產生 Android icon 尺寸

iOS 已有處理好的 icon（`ios/App/App/Assets.xcassets/AppIcon.appiconset/`）。

**方案 A（推薦）：用 Android Studio 內建工具**
1. 在 Android Studio 開啟 `android/` 資料夾
2. 右鍵 `app/src/main/res` → New → Image Asset
3. 選擇 Launcher Icons → 上傳原始 icon 圖片
4. Android Studio 自動產生所有 mipmap-* 尺寸

**方案 B：手動放置**

所需尺寸：
| 資料夾 | ic_launcher.png 尺寸 |
|--------|---------------------|
| `mipmap-mdpi` | 48×48 |
| `mipmap-hdpi` | 72×72 |
| `mipmap-xhdpi` | 96×96 |
| `mipmap-xxhdpi` | 144×144 |
| `mipmap-xxxhdpi` | 192×192 |

也建議提供 `ic_launcher_round.png`（圓形版，同尺寸）給支援 Adaptive Icon 的裝置。

**驗證**：
```bash
ls android/app/src/main/res/mipmap-xxxhdpi/
# 應有 ic_launcher.png（192×192）
```

---

## Phase 4 — Sync & 初次執行

### 任務 4.1：執行 `npx cap sync android`

```bash
npx cap sync android
```

這會：
- 將最新 web assets 複製到 Android project
- 更新 plugin 的 Gradle 設定

**注意**：每次修改 `capacitor.config.ts` 或 web code 後都要重跑 `cap sync`。

**驗證**：
```bash
# 無 error 輸出即可
```

### 任務 4.2：在 Android Studio 開啟並執行

```bash
npx cap open android
```

Android Studio 開啟後：
1. 等待 Gradle sync 完成（第一次較慢，需下載依賴）
2. 選擇裝置（實體 Android 手機或 AVD 模擬器）
3. 按 Run（▶）

**預期結果**：
- App 啟動，載入 `https://travelio-dev.vercel.app`
- `isNativeApp()` 回傳 `true`（user-agent 含 `RyochoNative`）
- 安裝提示 banner 不顯示（`install-prompt.tsx` 已有 `isNativeApp()` 判斷）

**驗證**：
- 打開 DevTools（Chrome `chrome://inspect`）確認 user-agent 含 `RyochoNative`
- 測試相機功能（收據辨識）：系統會彈出相機權限請求
- 測試 Google 登入：應能完整走完 OAuth 流程並透過 `ryocho://` scheme 回到 app

---

## Phase 5 — 打包發布

### 任務 5.1：設定 App Signing（首次）

在 Android Studio：
1. Build → Generate Signed Bundle / APK
2. 選 Android App Bundle（`.aab`）— Play Store 推薦格式
3. 建立或選擇 keystore 檔（`.jks`）：
   - Keystore path：存放在安全位置（**不要 commit 到 git**）
   - 填寫 Key alias、密碼、有效期（建議 25 年）
4. 選 Release build variant
5. 產出 `app-release.aab`

**APK（直接安裝測試用）**：
- 同上流程但選 APK → `app-release.apk`
- 可透過 `adb install app-release.apk` 安裝到裝置

### 任務 5.2：上架 Google Play（可選）

1. 前往 [Google Play Console](https://play.google.com/console)
2. 建立新 app（需 $25 一次性開發者費用）
3. 上傳 `app-release.aab`
4. 填寫商店資訊（截圖、描述）
5. 提交審核

---

## 注意事項

### Widget 同步（暫不實作）

`lib/native/widget-sync.ts` 的 `WidgetSync` plugin 是 iOS 專屬的 App Group 機制。在 Android 端：
- 所有 `WidgetSync` 呼叫已有 `try/catch` 保護，會靜默失敗
- **不需要任何修改**，Android 上跑起來不會 crash
- 若未來要實作 Android widget，需要另外建 `WidgetSyncAndroid` native plugin

### `lib/share-image.ts` 直接使用 `Capacitor.isNativePlatform()`

[lib/share-image.ts](lib/share-image.ts) 第 89 行直接呼叫 `Capacitor.isNativePlatform()` 而非 `isNativeApp()` helper。
- Android 的 `Capacitor.isNativePlatform()` 也會回傳 `true`，行為正確
- 不需修改，記錄差異即可

### `current_trip_id` localStorage 在 Android

已確認 logout 時會清除（obs 1443）。Android WebView 的 localStorage 與 iOS WKWebView 行為一致，不需額外處理。
