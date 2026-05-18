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

public class CashbackWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews views = buildViews(ctx);
            mgr.updateAppWidget(id, views);
        }
    }

    static RemoteViews buildViews(Context ctx) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_cashback);
        WidgetSnapshotParser.Snapshot snap = WidgetSnapshotParser.readAndParse(ctx);

        if (snap == null || snap.cashback == null) {
            views.setTextViewText(R.id.cashback_total, "NT$0");
            views.setTextViewText(R.id.cashback_cards, "無回饋資料");
            views.setTextViewText(R.id.cashback_avg_rate, "");
            views.setViewVisibility(R.id.top_card_panel, View.INVISIBLE);
        } else {
            WidgetSnapshotParser.Cashback cb = snap.cashback;

            views.setTextViewText(R.id.cashback_total, "NT$" + fmt(cb.totalTwd));
            views.setTextViewText(R.id.cashback_cards, cb.cardCount + " 張卡");
            views.setTextViewText(R.id.cashback_avg_rate,
                String.format("均 %.1f%%", cb.averageRate));

            if (cb.topCard != null) {
                views.setViewVisibility(R.id.top_card_panel, View.VISIBLE);
                views.setTextViewText(R.id.top_card_name, cb.topCard.cardName);
                views.setTextViewText(R.id.top_card_cashback, "NT$" + fmt(cb.topCard.cashbackTwd));
                views.setTextViewText(R.id.top_card_rate, cb.topCard.rateLabel);
            } else {
                views.setViewVisibility(R.id.top_card_panel, View.INVISIBLE);
            }
        }

        // click → summary page
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("ryocho://widget/summary"));
        intent.setPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(ctx, 102,
            intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.cashback_total, pi);

        return views;
    }

    static String fmt(int n) {
        return NumberFormat.getIntegerInstance().format(n);
    }
}
