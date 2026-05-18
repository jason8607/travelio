package com.jasonchen.ryocho;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import java.text.NumberFormat;

public class TrendWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = buildViews(ctx);
            mgr.updateAppWidget(id, views);
        }
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_trend);
        WidgetSnapshotParser.Snapshot snap = WidgetSnapshotParser.readAndParse(ctx);

        boolean isDark = (ctx.getResources().getConfiguration().uiMode
            & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;

        if (snap == null || snap.trip == null) {
            views.setTextViewText(R.id.trend_trip_name, "旅帳");
            views.setTextViewText(R.id.trend_total_jpy, "");
            views.setTextViewText(R.id.trend_avg, "請開啟 app 開始記帳");
            views.setViewVisibility(R.id.chart_image, View.GONE);
            return views;
        }

        WidgetSnapshotParser.Trip trip = snap.trip;

        views.setTextViewText(R.id.trend_trip_name, trip.name);
        views.setTextViewText(R.id.trend_total_jpy, "¥" + fmt(trip.totalJpy) + " 總花費");

        // Average per day
        int dayCount = trip.dailyTotals != null && trip.dailyTotals.length > 0
            ? trip.dailyTotals.length : 1;
        int avg = trip.totalJpy / dayCount;
        views.setTextViewText(R.id.trend_avg, "均 ¥" + fmt(avg) + " / 天");

        // Draw chart
        float density = ctx.getResources().getDisplayMetrics().density;
        int chartW = (int) (250 * density);   // approximate widget width
        int chartH = (int) (60 * density);    // chart area height
        String today = WidgetBarChartDrawer.todayString();
        Bitmap chart = WidgetBarChartDrawer.draw(chartW, chartH, trip.dailyTotals, today, isDark);
        views.setImageViewBitmap(R.id.chart_image, chart);

        // click → summary
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("ryocho://widget/summary"));
        intent.setPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(ctx, 104,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.chart_image, pi);

        return views;
    }

    static String fmt(int n) {
        return NumberFormat.getIntegerInstance().format(n);
    }
}
