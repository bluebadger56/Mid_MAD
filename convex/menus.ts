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
// ─── Seed Menu Mingguan (Vegan) ──────────────────────────────
export const seedWeeklyMenu = mutation({
  args: { week_start: v.string() },
  handler: async (ctx, args) => {
    const menus: Array<{
      day: string;
      meal_type: string;
      menu_name: string;
      description: string;
    }> = [
      // ── SENIN ──
      {
        day: "monday",
        meal_type: "breakfast",
        menu_name: "Nasi Goreng Sayuran",
        description:
          "Nasi goreng dengan wortel, kol, kacang polong & kecap manis",
      },
      {
        day: "monday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Sayur Lodeh",
        description: "Lodeh labu siam, terong, tempe & santan + nasi putih",
      },
      {
        day: "monday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Kangkung",
        description: "Tumis kangkung bawang putih + tahu bumbu bali",
      },
      // ── SELASA ──
      {
        day: "tuesday",
        meal_type: "breakfast",
        menu_name: "Bubur Oats + Pisang",
        description: "Bubur oat hangat dengan pisang & kacang tanah sangrai",
      },
      {
        day: "tuesday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Gulai Nangka",
        description: "Gulai nangka muda santan + perkedel jagung",
      },
      {
        day: "tuesday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Bayam",
        description: "Tumis bayam bawang merah + tempe orek kecap",
      },
      // ── RABU ──
      {
        day: "wednesday",
        meal_type: "breakfast",
        menu_name: "Nasi Uduk + Tempe Goreng",
        description: "Nasi uduk santan wangi + tempe goreng & sambal kecap",
      },
      {
        day: "wednesday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Sayur Asam",
        description: "Sayur asam kacang merah, jagung, labu siam + tahu goreng",
      },
      {
        day: "wednesday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Cap Cay Sayuran",
        description:
          "Cap cay brokoli, wortel, jamur, kembang kol + tempe mendoan",
      },
      // ── KAMIS ──
      {
        day: "thursday",
        meal_type: "breakfast",
        menu_name: "Lontong Sayur Lodeh",
        description: "Lontong dengan kuah lodeh sayuran & sambal goreng tempe",
      },
      {
        day: "thursday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Soto Sayuran",
        description: "Soto bening sayuran & tofu + perkedel kentang",
      },
      {
        day: "thursday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Terong",
        description: "Tumis terong bumbu pedas + tahu bacem manis",
      },
      // ── JUMAT ──
      {
        day: "friday",
        meal_type: "breakfast",
        menu_name: "Nasi Putih + Orak-arik Sayur",
        description: "Orak-arik wortel, buncis, kol & jagung manis",
      },
      {
        day: "friday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Sayur Terong",
        description: "Terong bumbu tomat + tempe goreng crispy",
      },
      {
        day: "friday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Kacang",
        description: "Tumis kacang panjang & jagung + tahu goreng crispy",
      },
      // ── SABTU ──
      {
        day: "saturday",
        meal_type: "breakfast",
        menu_name: "Nasi Goreng Sayuran",
        description: "Nasi goreng sayur lengkap kecap & bawang goreng",
      },
      {
        day: "saturday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Telur Dadar",
        description:
          "Telur dadar bumbu daun bawang + sayur bening bayam & jagung",
      },
      {
        day: "saturday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Tauge",
        description: "Tumis tauge kecap bawang putih + tempe bacem",
      },
      // ── MINGGU ──
      {
        day: "sunday",
        meal_type: "breakfast",
        menu_name: "Bubur Kacang Hijau",
        description: "Bubur kacang hijau santan & gula merah",
      },
      {
        day: "sunday",
        meal_type: "lunch",
        menu_name: "Nasi Putih + Sayur Asam",
        description: "Sayur asam segar + tempe mendoan & sambal",
      },
      {
        day: "sunday",
        meal_type: "dinner",
        menu_name: "Nasi Putih + Tumis Kangkung",
        description: "Tumis kangkung bawang + tahu bumbu kecap manis",
      },
    ];

    for (const m of menus) {
      const existing = await ctx.db
        .query("weekly_menus")
        .filter((q) =>
          q.and(
            q.eq(q.field("day"), m.day),
            q.eq(q.field("meal_type"), m.meal_type),
            q.eq(q.field("week_start"), args.week_start),
          ),
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          menu_name: m.menu_name,
          description: m.description,
        });
      } else {
        await ctx.db.insert("weekly_menus", {
          day: m.day,
          meal_type: m.meal_type,
          menu_name: m.menu_name,
          description: m.description,
          week_start: args.week_start,
        });
      }
    }

    return { inserted: menus.length };
  },
});
