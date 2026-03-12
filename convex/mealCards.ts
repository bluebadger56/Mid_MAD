import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Scan Kartu Makan ───────────────────────────────────────
export const scanMealCard = mutation({
  args: {
    card_id: v.string(),
    meal_type: v.string(), // "breakfast" | "lunch" | "dinner"
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("card_id"), args.card_id))
      .first();

    if (!user) return { success: false, message: "Kartu tidak terdaftar" };
    if (!user.is_active)
      return { success: false, message: "Kartu tidak aktif" };
    if (user.type === "outsider")
      return { success: false, message: "Bukan anak asrama (outsider)" };

    // ─── Validasi batas waktu scan ───────────────────────────
    // Gunakan WIB (UTC+7)
    const nowMs = Date.now();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibDate = new Date(nowMs + wibOffset);
    const hour = wibDate.getUTCHours();
    const minute = wibDate.getUTCMinutes();
    const timeDecimal = hour + minute / 60;

    const windows: Record<string, [number, number]> = {
      breakfast: [6, 7], // 06:00 – 07:00
      lunch: [12, 13], // 12:00 – 13:00
      dinner: [18, 19], // 18:00 – 19:00
    };
    const window = windows[args.meal_type];
    if (!window) return { success: false, message: "Jenis makan tidak valid" };
    if (timeDecimal < window[0] || timeDecimal >= window[1]) {
      const labels: Record<string, string> = {
        breakfast: "Pagi (06:00 – 07:00)",
        lunch: "Siang (12:00 – 13:00)",
        dinner: "Malam (18:00 – 19:00)",
      };
      return {
        success: false,
        message: `Di luar jadwal makan ${labels[args.meal_type]}`,
      };
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await ctx.db
      .query("meal_scans")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), user._id),
          q.eq(q.field("date"), today),
          q.eq(q.field("meal_type"), args.meal_type),
        ),
      )
      .first();

    if (existing)
      return {
        success: false,
        message: "Sudah scan untuk waktu makan ini hari ini",
      };

    await ctx.db.insert("meal_scans", {
      user_id: user._id,
      meal_type: args.meal_type,
      date: today,
      scanned_at: Date.now(),
    });

    return {
      success: true,
      message: `Berhasil! ${user.name} - ${args.meal_type}`,
      userType: user.type,
    };
  },
});

// ─── Get Meal Scans for Today ───────────────────────────────
export const getTodayScans = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("meal_scans")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    const scansWithUsers = await Promise.all(
      scans.map(async (scan) => {
        const user = await ctx.db.get(scan.user_id);
        return {
          ...scan,
          userName: user?.name ?? "Unknown",
          userType: user?.type ?? "unknown",
        };
      }),
    );
    return scansWithUsers;
  },
});

// ─── Statistik Makan per Hari ───────────────────────────────
export const getMealStats = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("meal_scans")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    return {
      breakfast: scans.filter((s) => s.meal_type === "breakfast").length,
      lunch: scans.filter((s) => s.meal_type === "lunch").length,
      dinner: scans.filter((s) => s.meal_type === "dinner").length,
      total: scans.length,
    };
  },
});

// ─── Status Makan Pribadi (per user per hari) ───────────────
export const getMyMealStatus = query({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("meal_scans")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.userId),
          q.eq(q.field("date"), args.date),
        ),
      )
      .collect();

    const breakfast = scans.find((s) => s.meal_type === "breakfast");
    const lunch = scans.find((s) => s.meal_type === "lunch");
    const dinner = scans.find((s) => s.meal_type === "dinner");

    return {
      breakfast: !!breakfast,
      lunch: !!lunch,
      dinner: !!dinner,
      breakfastAt: breakfast?.scanned_at ?? null,
      lunchAt: lunch?.scanned_at ?? null,
      dinnerAt: dinner?.scanned_at ?? null,
      total: scans.length,
    };
  },
});

// ─── Scan History Pribadi (per user per hari) ───────────────
export const getMyScansToday = query({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const scans = await ctx.db
      .query("meal_scans")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.userId),
          q.eq(q.field("date"), args.date),
        ),
      )
      .collect();
    return scans;
  },
});

// ─── Verifikasi Card ID (insider/outsider) ──────────────────
export const verifyCard = query({
  args: { card_id: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("card_id"), args.card_id))
      .first();

    if (!user) return { found: false, type: null, name: null };
    return { found: true, type: user.type, name: user.name, role: user.role };
  },
});
