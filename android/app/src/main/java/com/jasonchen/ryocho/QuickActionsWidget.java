package com.jasonchen.ryocho;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

public class QuickActionsWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_quick_actions);
            views.setOnClickPendingIntent(R.id.btn_new,   deepLinkIntent(ctx, "ryocho://shortcut/new",  0));
            views.setOnClickPendingIntent(R.id.btn_scan,  deepLinkIntent(ctx, "ryocho://shortcut/scan", 1));
            views.setOnClickPendingIntent(R.id.btn_stats, deepLinkIntent(ctx, "ryocho://shortcut/stats", 2));
            mgr.updateAppWidget(id, views);
        }
    }

    private PendingIntent deepLinkIntent(Context ctx, String uri, int requestCode) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
        intent.setPackage(ctx.getPackageName());
        return PendingIntent.getActivity(ctx, requestCode,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
