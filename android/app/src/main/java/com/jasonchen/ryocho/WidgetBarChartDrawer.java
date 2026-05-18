package com.jasonchen.ryocho;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class WidgetBarChartDrawer {

    /**
     * Draw a bar chart of daily totals.
     * @param widthPx  output bitmap width in pixels
     * @param heightPx output bitmap height in pixels
     * @param dailyTotals array of {date, amountJpy}
     * @param today today's date string "YYYY-MM-DD" (device local)
     * @param isDark dark mode flag
     */
    public static Bitmap draw(int widthPx, int heightPx,
            WidgetSnapshotParser.DailyTotal[] dailyTotals,
            String today, boolean isDark) {

        Bitmap bmp = Bitmap.createBitmap(widthPx, heightPx, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);

        if (dailyTotals == null || dailyTotals.length == 0) return bmp;

        // Find max amount (at least 1 to avoid division by zero)
        int maxAmt = 1;
        for (WidgetSnapshotParser.DailyTotal d : dailyTotals) {
            if (d.amountJpy > maxAmt) maxAmt = d.amountJpy;
        }

        float barAreaTop    = heightPx * 0.08f;
        float barAreaBottom = heightPx * 0.92f;
        float barAreaHeight = barAreaBottom - barAreaTop;
        float slotWidth     = (float) widthPx / dailyTotals.length;
        float barWidth      = slotWidth * 0.6f;
        float gapHalf       = slotWidth * 0.2f;

        // Colors: past=slate, today=Signal Blue, future=mist
        int colorPast   = isDark ? 0xFF475569 : 0xFF94A3B8;
        int colorToday  = isDark ? 0xFF3B82F6 : 0xFF2563EB;
        int colorFuture = isDark ? 0xFF1E293B : 0xFFE2E8F0;

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setStyle(Paint.Style.FILL);

        for (int i = 0; i < dailyTotals.length; i++) {
            WidgetSnapshotParser.DailyTotal d = dailyTotals[i];
            float barHeight = barAreaHeight * ((float) d.amountJpy / maxAmt);
            // minimum 2px height so zero-spend days are still visible
            if (barHeight < 2f) barHeight = 2f;

            float left  = i * slotWidth + gapHalf;
            float right = left + barWidth;
            float top   = barAreaBottom - barHeight;

            int cmp = d.date.compareTo(today);
            paint.setColor(cmp < 0 ? colorPast : cmp == 0 ? colorToday : colorFuture);

            float radius = barWidth * 0.25f;
            canvas.drawRoundRect(new RectF(left, top, right, barAreaBottom), radius, radius, paint);
        }

        return bmp;
    }

    /** Get today's date string in "yyyy-MM-dd" format using device local time. */
    public static String todayString() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }
}
