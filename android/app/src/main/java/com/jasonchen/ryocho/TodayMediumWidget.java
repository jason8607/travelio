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

public class TodayMediumWidget extends AppWidgetProvider {

    private static final int[][] CAT_IDS = {
        {R.id.cat_row_0, R.id.cat_icon_0, R.id.cat_label_0, R.id.cat_amount_0},
        {R.id.cat_row_1, R.id.cat_icon_1, R.id.cat_label_1, R.id.cat_amount_1},
        {R.id.cat_row_2, R.id.cat_icon_2, R.id.cat_label_2, R.id.cat_amount_2},
        {R.id.cat_row_3, R.id.cat_icon_3, R.id.cat_label_3, R.id.cat_amount_3},
    };

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = buildViews(ctx);
            mgr.updateAppWidget(id, views);
        }
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_today_medium);
        WidgetSnapshotParser.Snapshot snap = WidgetSnapshotParser.readAndParse(ctx);

        if (snap == null || !snap.shouldShowLedger) {
            views.setTextViewText(R.id.spent_jpy, "旅帳");
            views.setTextViewText(R.id.spent_twd, "請開啟 app");
            views.setTextViewText(R.id.trip_name, "");
            views.setViewVisibility(R.id.budget_bar_blue, View.VISIBLE);
            views.setViewVisibility(R.id.budget_bar_red, View.GONE);
            views.setProgressBar(R.id.budget_bar_blue, 100, 0, false);
            for (int[] row : CAT_IDS) views.setViewVisibility(row[0], View.INVISIBLE);
            return views;
        }

        // Left column
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
        views.setTextViewText(R.id.trip_name, snap.trip != null ? snap.trip.name : "");

        // Right column: categories
        for (int i = 0; i < CAT_IDS.length; i++) {
            int[] row = CAT_IDS[i];
            if (i < snap.todayByCategory.length) {
                WidgetSnapshotParser.CategorySlice cat = snap.todayByCategory[i];
                views.setViewVisibility(row[0], View.VISIBLE);
                views.setTextViewText(row[1], cat.icon);
                views.setTextViewText(row[2], cat.label);
                views.setTextViewText(row[3], "¥" + fmt(cat.amountJpy));
            } else {
                views.setViewVisibility(row[0], View.INVISIBLE);
            }
        }

        // click
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("ryocho://widget/categories"));
        intent.setPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(ctx, 101,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.spent_jpy, pi);

        return views;
    }

    static String fmt(int n) {
        return NumberFormat.getIntegerInstance().format(n);
    }
}
