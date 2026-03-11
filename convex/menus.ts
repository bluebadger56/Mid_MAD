import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Set Menu for a Day ─────────────────────────────────────
export const setMenu = mutation({
  args: {
    day: v.string(),
    meal_type: v.string(),
    menu_name: v.string(),
    description: v.optional(v.string()),
    week_start: v.string(),
  },
  handler: async (ctx, args) => {
    // Cek apakah sudah ada menu untuk hari & waktu ini di minggu ini
    const existing = await ctx.db
      .query("weekly_menus")
      .filter((q) =>
        q.and(
          q.eq(q.field("day"), args.day),
          q.eq(q.field("meal_type"), args.meal_type),
          q.eq(q.field("week_start"), args.week_start),
        ),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        menu_name: args.menu_name,
        description: args.description,
      });
      return existing._id;
    }

    return await ctx.db.insert("weekly_menus", {
      day: args.day,
      meal_type: args.meal_type,
      menu_name: args.menu_name,
      description: args.description,
      week_start: args.week_start,
    });
  },
});

// ─── Get Weekly Menu ────────────────────────────────────────
export const getWeeklyMenu = query({
  args: { week_start: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("weekly_menus")
      .filter((q) => q.eq(q.field("week_start"), args.week_start))
      .collect();
  },
});

// ─── Get Menu Favorites (jumlah mahasiswa makan per menu) ───
export const getMenuPopularity = query({
  args: { week_start: v.string() },
  handler: async (ctx, args) => {
    const menus = await ctx.db
      .query("weekly_menus")
      .filter((q) => q.eq(q.field("week_start"), args.week_start))
      .collect();

    const allScans = await ctx.db.query("meal_scans").collect();

    return menus.map((menu) => {
      const scansForThis = allScans.filter(
        (s) => s.meal_type === menu.meal_type && s.date !== undefined,
      );
      // Count scans matching the day of the menu
      const count = scansForThis.filter((s) => {
        const scanDate = new Date(s.date);
        const dayNames = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        return dayNames[scanDate.getDay()] === menu.day;
      }).length;

      return { ...menu, totalEaters: count };
    });
  },
});

// ─── Delete Menu ────────────────────────────────────────────
export const deleteMenu = mutation({
  args: { id: v.id("weekly_menus") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
