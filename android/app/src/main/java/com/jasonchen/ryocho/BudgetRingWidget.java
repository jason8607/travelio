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
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class BudgetRingWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = buildViews(ctx);
            mgr.updateAppWidget(id, views);
        }
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_budget_ring);
        WidgetSnapshotParser.Snapshot snap = WidgetSnapshotParser.readAndParse(ctx);

        int spentJpy = snap != null ? snap.today.spentJpy : 0;
        Integer budget = (snap != null) ? snap.today.budgetJpy : null;
        boolean over = budget != null && budget > 0 && spentJpy >= budget;
        int progress = (budget != null && budget > 0)
            ? Math.min(100, spentJpy * 100 / budget) : 0;

        if (over) {
            views.setViewVisibility(R.id.budget_ring_blue, View.GONE);
            views.setViewVisibility(R.id.budget_ring_red, View.VISIBLE);
            views.setProgressBar(R.id.budget_ring_red, 100, progress, false);
        } else {
            views.setViewVisibility(R.id.budget_ring_blue, View.VISIBLE);
            views.setViewVisibility(R.id.budget_ring_red, View.GONE);
            views.setProgressBar(R.id.budget_ring_blue, 100, progress, false);
        }
        views.setTextViewText(R.id.ring_spent_jpy, "¥" + fmt(spentJpy));
        views.setTextViewText(R.id.ring_day_label, computeDayLabel(snap));

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("ryocho://widget/today"));
        intent.setPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(ctx, 103,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.budget_ring_blue, pi);
        views.setOnClickPendingIntent(R.id.budget_ring_red, pi);

        return views;
    }

    static String computeDayLabel(WidgetSnapshotParser.Snapshot snap) {
        if (snap == null || snap.trip == null) return "";
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            Date start = sdf.parse(snap.trip.startDate);
            Date end = sdf.parse(snap.trip.endDate);
            Date today = sdf.parse(sdf.format(new Date()));
            if (start == null || end == null || today == null) return "";
            long totalDays = TimeUnit.MILLISECONDS.toDays(end.getTime() - start.getTime()) + 1;
            long dayNum = TimeUnit.MILLISECONDS.toDays(today.getTime() - start.getTime()) + 1;
            dayNum = Math.max(1, Math.min(dayNum, totalDays));
            return "第 " + dayNum + " 天 / 共 " + totalDays + " 天";
        } catch (Exception e) {
            return "";
        }
    }

    static String fmt(int n) {
        return NumberFormat.getIntegerInstance().format(n);
    }
}
