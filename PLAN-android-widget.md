# Plan: 旅帳 Android Widget 實作

## 背景與目標

iOS 已有 5 種 widget，透過 Capacitor native plugin 把 `WidgetSnapshot` JSON 寫進 App Group，再由 SwiftUI widget extension 讀取。

Android 沒有 App Group，但可用：
- **SharedPreferences** 取代 App Group（同一 app process 內可存取）
- **`AppWidgetProvider`** 取代 SwiftUI WidgetKit
- **`RemoteViews`** 渲染 widget UI（限制：只能用標準 View，複雜圖形需畫成 `Bitmap`）

本計畫實作 5 種 widget，與 iOS 功能對應：

| Android Widget | iOS 對應 | 尺寸 | 資料複雜度 |
|---|---|---|---|
| `TodaySmallWidget` | RyochoTodayWidget small | 2×2 | 低（純文字 + ProgressBar） |
| `TodayMediumWidget` | RyochoTodayWidget medium | 4×2 | 中（文字 + 色條） |
| `QuickActionsWidget` | RyochoQuickActionsWidget | 4×2 | 無資料（pure shortcuts） |
| `CashbackWidget` | RyochoCashbackWidget | 4×2 | 中（純文字） |
| `BudgetRingWidget` | RyochoBudgetRingWidget | 2×2 | 中（XML drawable ring + ProgressBar） |
| `TrendWidget` | RyochoTrendWidget | 4×2 | 高（Canvas 畫 bar chart） |

---

## Phase 0 — 已知事實（不需再查）

### WidgetSnapshot TypeScript 型別（`types/widget.ts`）

```typescript
interface WidgetSnapshot {
  version: 1;
  isLoggedIn: boolean;
  isGuest: boolean;
  generatedAt: string;              // ISO 8601
  today: { spentJpy, spentTwd, budgetJpy, remainingJpy }
  todayByCategory: Array<{ category, label, icon, color, amountJpy }>
  trip: { id, name, startDate, endDate, totalJpy,
          dailyTotals: Array<{date, amountJpy}>,
          topSettlement, settled } | null
  cashback: { totalTwd, cardCount, averageRate,
              topCard: { cardName, cashbackTwd, rateLabel, rate } | null } | null
}
```

### 資料流（不需更改 TypeScript）

```
buildWidgetSnapshot() → widgetSync.write(snapshot)
  → Native.setSnapshot({ json: JSON.stringify(snapshot) })   ← 已有 try/catch
    → [Android] WidgetSyncPlugin.java → SharedPreferences
      → AppWidgetManager broadcast → 各 AppWidgetProvider.onUpdate()
```

`widgetSync.write()` 在 `hooks/use-widget-sync.ts` 已自動呼叫（debounce 600ms + 前景切換時）。目前 Android 無 plugin，呼叫靜默失敗。實作 plugin 後自動生效，**不需修改任何 TypeScript**。

### 設計 Token（`WidgetTheme.swift` → Android 對應）

```xml
<!-- colors.xml -->
<color name="widget_bg">#FFFFFF</color>
<color name="widget_ink">#0F172A</color>
<color name="widget_smoke">#64748B</color>
<color name="widget_mist">#F1F5F9</color>
<color name="widget_hairline">#E2E8F0</color>
<color name="widget_blue">#2563EB</color>
<color name="widget_sky">#DBEAFE</color>
<!-- Night mode counterparts in res/values-night/colors.xml -->
```

### Deep Link URI（`ryocho://` scheme 已在 AndroidManifest 設定）

```
ryocho://widget/today       → 今日消費頁
ryocho://widget/summary     → 統計頁
ryocho://widget/categories  → 分類頁
ryocho://shortcut/new       → 新增記帳
ryocho://shortcut/scan      → AI 掃描
ryocho://shortcut/stats     → 統計頁
```

---

## Phase 1 — WidgetSync Android Capacitor Plugin

### 說明

這是所有 widget 的基礎。對應 iOS 的 `WidgetSyncPlugin.swift`，用 Java 實作，將 JSON 寫進 `SharedPreferences`，並廣播更新到所有已安裝的 widget。

### 任務 1.1：建立 `WidgetSyncPlugin.java`

**檔案**：`android/app/src/main/java/com/jasonchen/ryocho/WidgetSyncPlugin.java`

```java
package com.jasonchen.ryocho;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetSync")
public class WidgetSyncPlugin extends Plugin {

    static final String PREFS_NAME = "ryocho_widget";
    static final String KEY_SNAPSHOT = "snapshot_json";

    @PluginMethod
    public void setSnapshot(PluginCall call) {
        String json = call.getString("json");
        if (json == null) { call.reject("missing 'json' string"); return; }

        Context ctx = getContext();
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
           .edit().putString(KEY_SNAPSHOT, json).apply();

        broadcastUpdateAll(ctx);
        call.resolve();
    }

    @PluginMethod
    public void clear(PluginCall call) {
        Context ctx = getContext();
        ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
           .edit().remove(KEY_SNAPSHOT).apply();

        broadcastUpdateAll(ctx);
        call.resolve();
    }

    @PluginMethod
    public void reloadAllTimelines(PluginCall call) {
        broadcastUpdateAll(getContext());
        call.resolve();
    }

    static void broadcastUpdateAll(Context ctx) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
        Class<?>[] providers = {
            TodaySmallWidget.class,
            TodayMediumWidget.class,
            QuickActionsWidget.class,
            CashbackWidget.class,
            BudgetRingWidget.class,
            TrendWidget.class,
        };
        for (Class<?> cls : providers) {
            int[] ids = mgr.getAppWidgetIds(new ComponentName(ctx, cls));
            if (ids.length > 0) mgr.notifyAppWidgetViewDataChanged(ids, android.R.id.list);
            // actual update happens in each provider's onUpdate
            android.content.Intent intent = new android.content.Intent(
                AppWidgetManager.ACTION_APPWIDGET_UPDATE, null, ctx, cls);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            ctx.sendBroadcast(intent);
        }
    }
}
```

### 任務 1.2：建立 `WidgetSnapshotParser.java`

**檔案**：`android/app/src/main/java/com/jasonchen/ryocho/WidgetSnapshotParser.java`

負責把 SharedPreferences 裡的 JSON 字串 parse 成 Java 物件。用 `org.json.JSONObject`（Android 內建，不需額外依賴）。

```java
package com.jasonchen.ryocho;

import org.json.JSONArray;
import org.json.JSONObject;

public class WidgetSnapshotParser {

    public static class Snapshot {
        public boolean shouldShowLedger;  // isLoggedIn || isGuest || trip != null
        public Today today;
        public CategorySlice[] todayByCategory;
        public Trip trip;       // nullable
        public Cashback cashback; // nullable
    }

    public static class Today {
        public int spentJpy;
        public int spentTwd;
        public Integer budgetJpy;    // nullable
        public Integer remainingJpy; // nullable
    }

    public static class CategorySlice {
        public String label;
        public String icon;
        public String color;  // hex
        public int amountJpy;
    }

    public static class Trip {
        public String name;
        public int totalJpy;
        public DailyTotal[] dailyTotals;
    }

    public static class DailyTotal {
        public String date;   // "YYYY-MM-DD"
        public int amountJpy;
    }

    public static class Cashback {
        public int totalTwd;
        public int cardCount;
        public float averageRate;
        public CashbackTopCard topCard; // nullable
    }

    public static class CashbackTopCard {
        public String cardName;
        public int cashbackTwd;
        public String rateLabel;
    }

    /** Returns null if json is missing/invalid. */
    public static Snapshot parse(String json) {
        // ... parse each field from JSONObject
        // implement all getOpt* calls, return null on any JSONException
    }
}
```

（實作時補完 `parse()` 方法，每個欄位用 `optInt`/`optString`/`isNull` 處理 null-safe。）

### 任務 1.3：在 `MainActivity.java` 註冊 Plugin

**檔案**：`android/app/src/main/java/com/jasonchen/ryocho/MainActivity.java`

```java
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetSyncPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

**驗證**：
```bash
grep "WidgetSyncPlugin" android/app/src/main/java/com/jasonchen/ryocho/MainActivity.java
# 應出現 registerPlugin(WidgetSyncPlugin.class)
```

---

## Phase 2 — QuickActions Widget（最簡單，無資料依賴）

### 說明

對應 iOS 的 `QuickActionsWidget`，3 個捷徑按鈕，不讀取任何 WidgetSnapshot 資料。

### 任務 2.1：建立 widget layout XML

**檔案**：`android/app/src/main/res/layout/widget_quick_actions.xml`

LinearLayout (horizontal)，3 個子 LinearLayout（各佔 1/3 寬度），每個含：
- `ImageView`（emoji 或 icon）
- `TextView`（標題：記帳 / 掃描 / 統計）

配色：`@color/widget_bg` 背景，`@color/widget_blue` 按鈕色，`border-radius` 用 drawable shape。

### 任務 2.2：建立 widget info XML

**檔案**：`android/app/src/main/res/xml/widget_quick_actions_info.xml`

```xml
<appwidget-provider
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:updatePeriodMillis="0"
    android:initialLayout="@layout/widget_quick_actions"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
```

### 任務 2.3：建立 `QuickActionsWidget.java`

```java
public class QuickActionsWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_quick_actions);
            views.setOnClickPendingIntent(R.id.btn_new,    deepLinkIntent(ctx, "ryocho://shortcut/new"));
            views.setOnClickPendingIntent(R.id.btn_scan,   deepLinkIntent(ctx, "ryocho://shortcut/scan"));
            views.setOnClickPendingIntent(R.id.btn_stats,  deepLinkIntent(ctx, "ryocho://shortcut/stats"));
            mgr.updateAppWidget(id, views);
        }
    }

    private PendingIntent deepLinkIntent(Context ctx, String uri) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
        intent.setPackage(ctx.getPackageName());
        return PendingIntent.getActivity(ctx, uri.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
```

### 任務 2.4：在 `AndroidManifest.xml` 註冊

在 `<application>` 內加入：

```xml
<receiver android:name=".QuickActionsWidget" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_quick_actions_info" />
</receiver>
```

**驗證**：安裝 app → 長按桌面 → 選 Widget → 應看到「旅帳 QuickActions」。

---

## Phase 3 — Today Widget（Small + Medium）

### 說明

Today Small：顯示今日花費金額 + budget progress bar。
Today Medium：左側同 Small，右側顯示 top 4 分類（icon + 金額）。

### 任務 3.1：建立色彩資源

**檔案**：`android/app/src/main/res/values/widget_colors.xml`

```xml
<resources>
    <color name="widget_bg">#FFFFFF</color>
    <color name="widget_ink">#0F172A</color>
    <color name="widget_smoke">#64748B</color>
    <color name="widget_mist">#F1F5F9</color>
    <color name="widget_hairline">#E2E8F0</color>
    <color name="widget_blue">#2563EB</color>
    <color name="widget_sky">#DBEAFE</color>
    <color name="widget_red">#EF4444</color>
</resources>
```

**檔案**：`android/app/src/main/res/values-night/widget_colors.xml`（dark mode 對應）

```xml
<resources>
    <color name="widget_bg">#0B1220</color>
    <color name="widget_ink">#E2E8F0</color>
    <color name="widget_smoke">#94A3B8</color>
    <color name="widget_mist">#1E293B</color>
    <color name="widget_hairline">#1E293B</color>
    <color name="widget_blue">#3B82F6</color>
    <color name="widget_sky">#1E3A8A</color>
    <color name="widget_red">#F87171</color>
</resources>
```

### 任務 3.2：建立 Today Small layout + AppWidgetProvider

**Layout**：`res/layout/widget_today_small.xml`

```
┌─────────────────┐
│ 今日花費          │ ← smoke text, 12sp
│ ¥1,234          │ ← ink text, 28sp bold
│ NT$250          │ ← smoke text, 12sp
│ [████░░░░] 45%  │ ← ProgressBar (blue→red when ≥100%)
│ 旅程名稱          │ ← smoke text, 10sp
└─────────────────┘
```

**Java**：`TodaySmallWidget.java`
- `onUpdate()` 讀取 SharedPreferences → parse JSON → 設定 RemoteViews
- budget progress：`(spentJpy / budgetJpy * 100).coerceIn(0, 100)`
- budget ≥100%：progress bar 色改紅
- `shouldShowLedger` = false 時：顯示「請開啟 app 開始記帳」
- 點擊整個 widget → `ryocho://widget/today`

**widget info**：`res/xml/widget_today_small_info.xml`（2×2 cells, 110×110dp min）

**AndroidManifest** 加入 receiver。

### 任務 3.3：建立 Today Medium layout + AppWidgetProvider

**Layout**：`res/layout/widget_today_medium.xml`

```
┌──────────────┬───────────────┐
│ 今日花費       │ 🍜 餐飲  ¥800 │
│ ¥1,234       │ 🚃 交通  ¥300 │
│ NT$250       │ 🛒 購物  ¥100 │
│ [████░░░] 45%│ ☕ 其他   ¥34 │
└──────────────┴───────────────┘
```

右側 4 行分類：`todayByCategory` 前 4 筆。
左側同 Small。

**widget info**：`res/xml/widget_today_medium_info.xml`（4×2 cells, 250×110dp min）

---

## Phase 4 — Cashback Widget

### 說明

對應 iOS `CashbackWidget`，純文字佈局，難度低。

### 任務 4.1：建立 layout + AppWidgetProvider

**Layout**：`res/layout/widget_cashback.xml`

```
┌────────────────────────────┐
│ 信用卡回饋    [藍色區塊       ]│
│ NT$1,234    [最佳：富邦J卡   ]│
│ 3 張卡       [NT$800        ]│
│ 均 3.2%     [8.5% 海外消費  ]│
└────────────────────────────┘
```

左欄：`cashback.totalTwd`、`cashback.cardCount`、`cashback.averageRate`。
右欄（藍底）：`cashback.topCard.cardName`、`cashback.topCard.cashbackTwd`、`cashback.topCard.rateLabel`。
`cashback` 為 null 時顯示「無信用卡回饋資料」。

**widget info**：4×2 cells。

---

## Phase 5 — BudgetRing Widget（XML drawable ring + ProgressBar）

### 說明

對應 iOS `BudgetRingWidget`，中央顯示花費金額，外圈是圓弧 progress ring。

使用 Android 內建的 `ProgressBar` + 自訂 `progressDrawable`（`shape="ring"` XML drawable）實作，**不需 Canvas / Bitmap**。超過 100% 時切換為紅色版 drawable。

### 任務 5.1：建立 ring drawable XML（藍色 + 紅色各一）

**檔案**：`android/app/src/main/res/drawable/widget_ring_blue.xml`

```xml
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@android:id/background">
        <shape android:shape="ring"
            android:innerRadiusRatio="2.8"
            android:thickness="8dp"
            android:useLevel="false">
            <solid android:color="@color/widget_mist"/>
        </shape>
    </item>
    <item android:id="@android:id/progress">
        <rotate
            android:fromDegrees="-90"
            android:toDegrees="270"
            android:pivotX="50%"
            android:pivotY="50%">
            <shape android:shape="ring"
                android:innerRadiusRatio="2.8"
                android:thickness="8dp">
                <solid android:color="@color/widget_blue"/>
            </shape>
        </rotate>
    </item>
</layer-list>
```

**檔案**：`android/app/src/main/res/drawable/widget_ring_red.xml`

同上，把最後一個 `<solid android:color="@color/widget_blue"/>` 改成 `@color/widget_red`。

### 任務 5.2：建立 layout

**Layout**：`res/layout/widget_budget_ring.xml`

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/widget_bg"
    android:padding="8dp">

    <!-- 圓弧 ring -->
    <ProgressBar
        android:id="@+id/budget_ring"
        style="?android:attr/progressBarStyleHorizontal"
        android:progressDrawable="@drawable/widget_ring_blue"
        android:max="100"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_gravity="center" />

    <!-- 中央文字（疊在 ring 上方） -->
    <LinearLayout
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="center"
        android:orientation="vertical">

        <TextView
            android:id="@+id/spent_jpy"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            android:textColor="@color/widget_ink"
            android:textSize="20sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/day_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            android:textColor="@color/widget_smoke"
            android:textSize="10sp" />
    </LinearLayout>

</FrameLayout>
```

### 任務 5.3：建立 `BudgetRingWidget.java`

```java
@Override
public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
    for (int id : ids) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_budget_ring);

        Snapshot snap = readSnapshot(ctx);
        int spentJpy   = snap != null ? snap.today.spentJpy : 0;
        Integer budget = snap != null ? snap.today.budgetJpy : null;
        boolean over   = budget != null && budget > 0 && spentJpy >= budget;
        int progress   = (budget != null && budget > 0)
            ? Math.min(100, spentJpy * 100 / budget) : 0;

        // 切換 drawable（藍 / 紅）
        views.setInt(R.id.budget_ring, "setProgressDrawable",
            over ? R.drawable.widget_ring_red : R.drawable.widget_ring_blue);
        views.setProgressBar(R.id.budget_ring, 100, progress, false);

        // 中央文字
        views.setTextViewText(R.id.spent_jpy, "¥" + formatJpy(spentJpy));
        views.setTextViewText(R.id.day_label, computeDayLabel(snap));

        views.setOnClickPendingIntent(R.id.budget_ring,
            deepLinkIntent(ctx, "ryocho://widget/today"));
        mgr.updateAppWidget(id, views);
    }
}
```

**widget info**：`res/xml/widget_budget_ring_info.xml`（2×2 cells，110×110dp min）。

---

## Phase 6 — Trend Widget（Canvas 畫 Bar Chart）

### 說明

對應 iOS `TrendWidget`，顯示 `trip.dailyTotals` 每日花費 bar chart。

### 任務 6.1：建立 `WidgetBarChartDrawer.java`

```java
public class WidgetBarChartDrawer {
    /**
     * @param dailyTotals  { date: "YYYY-MM-DD", amountJpy: int }[]
     * @param today        今天日期字串 "YYYY-MM-DD"（從設備本地時間取）
     */
    public static Bitmap draw(int widthPx, int heightPx,
                               DailyTotal[] dailyTotals, String today, boolean isDark) {
        Bitmap bmp = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);

        if (dailyTotals == null || dailyTotals.length == 0) return bmp;

        int maxAmt = 1;
        for (DailyTotal d : dailyTotals) maxAmt = Math.max(maxAmt, d.amountJpy);

        float barAreaTop = heightPx * 0.05f;
        float barAreaBottom = heightPx * 0.85f;
        float barAreaHeight = barAreaBottom - barAreaTop;
        float totalWidth = widthPx;
        float barWidth = (totalWidth / dailyTotals.length) * 0.65f;
        float gap = (totalWidth / dailyTotals.length) * 0.35f;

        // 顏色：past=slate, today=Signal Blue, future=mist
        int colorPast   = isDark ? 0xFF475569 : 0xFF94A3B8;
        int colorToday  = isDark ? 0xFF3B82F6 : 0xFF2563EB;
        int colorFuture = isDark ? 0xFF1E293B : 0xFFE2E8F0;

        for (int i = 0; i < dailyTotals.length; i++) {
            DailyTotal d = dailyTotals[i];
            float barHeight = barAreaHeight * ((float) d.amountJpy / maxAmt);
            float left = i * (barWidth + gap) + gap / 2f;
            float right = left + barWidth;
            float top = barAreaBottom - barHeight;

            Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
            p.setStyle(Paint.Style.FILL);
            int cmp = d.date.compareTo(today);
            p.setColor(cmp < 0 ? colorPast : cmp == 0 ? colorToday : colorFuture);

            RectF rect = new RectF(left, top, right, barAreaBottom);
            float radius = barWidth * 0.25f;
            canvas.drawRoundRect(rect, radius, radius, p);
        }

        return bmp;
    }
}
```

### 任務 6.2：建立 layout + AppWidgetProvider

**Layout**：`res/layout/widget_trend.xml`

```
┌────────────────────────────────┐
│ 旅程名稱          ¥12,345 總花費 │ ← header row
│ [bar chart ImageView           ]│
│  平均 ¥2,469 / 天               │ ← footer
└────────────────────────────────┘
```

**Provider**：`TrendWidget.java`
- Header 顯示 `trip.name` + `trip.totalJpy`
- Footer 顯示 `totalJpy ÷ dailyTotals.length`
- Chart ImageView 設定 `widgetBarChartDrawer.draw(...)` 的 Bitmap
- `trip` 為 null 時顯示 empty state
- 點擊 → `ryocho://widget/summary`

**widget info**：4×2 cells。

---

## Phase 7 — AndroidManifest 最終確認

### 任務 7.1：確認所有 widget receiver 都已註冊

`android/app/src/main/AndroidManifest.xml` 的 `<application>` 內應有 6 個 receiver：

```xml
<!-- TodaySmallWidget -->
<receiver android:name=".TodaySmallWidget" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data android:name="android.appwidget.provider"
        android:resource="@xml/widget_today_small_info" />
</receiver>

<!-- 重複以上結構給：TodayMediumWidget, QuickActionsWidget,
     CashbackWidget, BudgetRingWidget, TrendWidget -->
```

### 任務 7.2：確認深層連結 intent filter 已有（前次已加）

```bash
grep "ryocho" android/app/src/main/AndroidManifest.xml
# 應看到 android:scheme="ryocho" 的 intent-filter
```

### 驗證 checklist

```bash
# 1. 所有 Java 檔案存在
ls android/app/src/main/java/com/jasonchen/ryocho/Widget*.java
# 應有 6 個 provider + WidgetSyncPlugin + WidgetSnapshotParser + WidgetBarChartDrawer

# 2. 所有 XML 資源存在
ls android/app/src/main/res/layout/widget_*.xml    # 5 個 layout
ls android/app/src/main/res/xml/widget_*_info.xml  # 6 個 info
ls android/app/src/main/res/values/widget_colors.xml
ls android/app/src/main/res/values-night/widget_colors.xml

# 3. Manifest 有 6 個 receiver
grep -c "AppWidgetProvider\|appwidget.provider" android/app/src/main/AndroidManifest.xml
```

---

## 注意事項

### RemoteViews 限制

Android widget 只能使用這些 View 類型（其他會 crash）：
- `FrameLayout`, `LinearLayout`, `RelativeLayout`, `GridLayout`
- `AnalogClock`, `Button`, `Chronometer`, `ImageButton`, `ImageView`
- `ProgressBar`, `TextView`, `ViewFlipper`, `ListView`, `GridView`
- `StackView`, `AdapterViewFlipper`

**不可使用** `ConstraintLayout`、自訂 View class、任何第三方 View。

### Canvas 圖形（Phase 6 only）

TrendWidget 的 bar chart**必須畫成 `Bitmap` 再設定到 `ImageView`**，不可直接用自訂 View。

BudgetRing（Phase 5）改用 XML drawable `shape="ring"` + `ProgressBar`，不需 Canvas。

### Dark Mode

`Configuration.UI_MODE_NIGHT_YES` 在 `onUpdate()` 時讀取，決定使用哪套顏色。`values-night/widget_colors.xml` 只影響 XML layout 的靜態色彩，動態畫 Bitmap 時需在 Java 中手動判斷。

### 不需修改 TypeScript

`widgetSync.write()` 已有 try/catch，plugin 實作後自動生效。`isNativeApp()` 在 Android 上為 `true`（`appendUserAgent: "RyochoNative"` 已設定），整條呼叫鏈自動啟動。

### Widget 更新頻率

`updatePeriodMillis="0"` — 完全由 app push（`broadcastUpdateAll()`）驅動，不依賴系統定時更新，符合電量最佳化政策。
