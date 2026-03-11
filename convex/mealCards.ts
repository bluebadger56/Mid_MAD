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
