package com.jasonchen.ryocho;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class WidgetSnapshotParser {

    public static class Snapshot {
        public boolean shouldShowLedger;
        public Today today = new Today();
        public CategorySlice[] todayByCategory = new CategorySlice[0];
        public Trip trip;
        public Cashback cashback;
    }

    public static class Today {
        public int spentJpy;
        public int spentTwd;
        public Integer budgetJpy;
        public Integer remainingJpy;
    }

    public static class CategorySlice {
        public String label = "";
        public String icon = "";
        public String color = "#64748B";
        public int amountJpy;
    }

    public static class Trip {
        public String name = "";
        public String startDate = "";
        public String endDate = "";
        public int totalJpy;
        public DailyTotal[] dailyTotals = new DailyTotal[0];
    }

    public static class DailyTotal {
        public String date = "";
        public int amountJpy;
    }

    public static class Cashback {
        public int totalTwd;
        public int cardCount;
        public float averageRate;
        public CashbackTopCard topCard;
    }

    public static class CashbackTopCard {
        public String cardName = "";
        public int cashbackTwd;
        public String rateLabel = "";
    }

    /** Read snapshot JSON from SharedPreferences and parse it. Returns null if missing/invalid. */
    public static Snapshot readAndParse(Context ctx) {
        SharedPreferences prefs = ctx.getSharedPreferences(
            WidgetSyncPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(WidgetSyncPlugin.KEY_SNAPSHOT, null);
        if (json == null) return null;
        return parse(json);
    }

    /** Parse a JSON string into a Snapshot. Returns null on any error. */
    public static Snapshot parse(String json) {
        try {
            JSONObject root = new JSONObject(json);
            Snapshot snap = new Snapshot();

            boolean isLoggedIn = root.optBoolean("isLoggedIn", false);
            boolean isGuest = root.optBoolean("isGuest", false);
            boolean hasTrip = !root.isNull("trip");
            snap.shouldShowLedger = isLoggedIn || isGuest || hasTrip;

            // today
            if (!root.isNull("today")) {
                JSONObject t = root.getJSONObject("today");
                snap.today.spentJpy = t.optInt("spentJpy", 0);
                snap.today.spentTwd = t.optInt("spentTwd", 0);
                snap.today.budgetJpy = t.isNull("budgetJpy") ? null : t.optInt("budgetJpy", 0);
                snap.today.remainingJpy = t.isNull("remainingJpy") ? null : t.optInt("remainingJpy", 0);
            }

            // todayByCategory
            if (!root.isNull("todayByCategory")) {
                JSONArray arr = root.getJSONArray("todayByCategory");
                snap.todayByCategory = new CategorySlice[arr.length()];
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.getJSONObject(i);
                    CategorySlice s = new CategorySlice();
                    s.label = o.optString("label", "");
                    s.icon = o.optString("icon", "");
                    s.color = o.optString("color", "#64748B");
                    s.amountJpy = o.optInt("amountJpy", 0);
                    snap.todayByCategory[i] = s;
                }
            }

            // trip
            if (!root.isNull("trip")) {
                JSONObject t = root.getJSONObject("trip");
                Trip trip = new Trip();
                trip.name = t.optString("name", "");
                trip.startDate = t.optString("startDate", "");
                trip.endDate = t.optString("endDate", "");
                trip.totalJpy = t.optInt("totalJpy", 0);
                if (!t.isNull("dailyTotals")) {
                    JSONArray arr = t.getJSONArray("dailyTotals");
                    trip.dailyTotals = new DailyTotal[arr.length()];
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject o = arr.getJSONObject(i);
                        DailyTotal d = new DailyTotal();
                        d.date = o.optString("date", "");
                        d.amountJpy = o.optInt("amountJpy", 0);
                        trip.dailyTotals[i] = d;
                    }
                }
                snap.trip = trip;
            }

            // cashback
            if (!root.isNull("cashback")) {
                JSONObject c = root.getJSONObject("cashback");
                Cashback cb = new Cashback();
                cb.totalTwd = c.optInt("totalTwd", 0);
                cb.cardCount = c.optInt("cardCount", 0);
                cb.averageRate = (float) c.optDouble("averageRate", 0.0);
                if (!c.isNull("topCard")) {
                    JSONObject tc = c.getJSONObject("topCard");
                    CashbackTopCard top = new CashbackTopCard();
                    top.cardName = tc.optString("cardName", "");
                    top.cashbackTwd = tc.optInt("cashbackTwd", 0);
                    top.rateLabel = tc.optString("rateLabel", "");
                    cb.topCard = top;
                }
                snap.cashback = cb;
            }

            return snap;
        } catch (JSONException e) {
            return null;
        }
    }
}
