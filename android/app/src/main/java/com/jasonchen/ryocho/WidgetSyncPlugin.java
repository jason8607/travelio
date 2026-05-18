package com.jasonchen.ryocho;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
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
            Intent intent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE, null, ctx, cls);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            ctx.sendBroadcast(intent);
        }
    }
}
