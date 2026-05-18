package com.jasonchen.ryocho;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;
import java.text.NumberFormat;

public class TodaySmallWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = buildViews(ctx);
            mgr.updateAppWidget(id, views);
        }
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_today_small);
        WidgetSnapshotParser.Snapshot snap = WidgetSnapshotParser.readAndParse(ctx);

        if (snap == null || !snap.shouldShowLedger) {
            views.setTextViewText(R.id.spent_jpy, "旅帳");
            views.setTextViewText(R.id.spent_twd, "請開啟 app");
            views.setTextViewText(R.id.trip_name, "開始記帳");
            views.setViewVisibility(R.id.budget_bar_blue, View.VISIBLE);
            views.setViewVisibility(R.id.budget_bar_red, View.GONE);
            views.setProgressBar(R.id.budget_bar_blue, 100, 0, false);
        } else {
            views.setTextViewText(R.id.spent_jpy, "¥" + fmt(snap.today.spentJpy));
            views.setTextViewText(R.id.spent_twd, "NT$" + fmt(snap.today.spentTwd));

            // budget progress — use two ProgressBars, toggle visibility
            if (snap.today.budgetJpy != null && snap.today.budgetJpy > 0) {
                int pct = Math.min(100, snap.today.spentJpy * 100 / snap.today.budgetJpy);
                boolean over = snap.today.spentJpy >= snap.today.budgetJpy;
                if (over) {
                    views.setViewVisibility(R.id.budget_bar_blue, View.GONE);
                    views.setViewVisibility(R.id.budget_bar_red, View.VISIBLE);
                    views.setProgressBar(R.id.budget_bar_red, 100, pct, false);
                } else {
                    views.setViewVisibility(R.id.budget_bar_blue, View.VISIBLE);
                    views.setViewVisibility(R.id.budget_bar_red, View.GONE);
                    views.setProgressBar(R.id.budget_bar_blue, 100, pct, false);
                }
            } else {
                views.setViewVisibility(R.id.budget_bar_blue, View.VISIBLE);
                views.setViewVisibility(R.id.budget_bar_red, View.GONE);
                views.setProgressBar(R.id.budget_bar_blue, 100, 0, false);
            }

            // trip name
            String name = (snap.trip != null) ? snap.trip.name : "";
            views.setTextViewText(R.id.trip_name, name);
        }

        // click → open app deep link
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("ryocho://widget/today"));
        intent.setPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(ctx, 100,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.spent_jpy, pi);

        return views;
    }

    static String fmt(int n) {
        return NumberFormat.getIntegerInstance().format(n);
    }
}
