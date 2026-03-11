import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Clock In ───────────────────────────────────────────────
export const clockIn = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await ctx.db
      .query("staff_attendance")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("date"), today),
        ),
      )
      .first();

    if (existing) return { success: false, message: "Sudah clock in hari ini" };

    const now = Date.now();
    const hour = new Date(now).getHours();
    const status = hour > 7 ? "late" : "present";

    await ctx.db.insert("staff_attendance", {
      user_id: args.user_id,
      date: today,
      clock_in: now,
      status,
    });

    return { success: true, message: `Clock in berhasil (${status})` };
  },
});

// ─── Clock Out ──────────────────────────────────────────────
export const clockOut = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const record = await ctx.db
      .query("staff_attendance")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("date"), today),
        ),
      )
      .first();

    if (!record) return { success: false, message: "Belum clock in hari ini" };
    if (record.clock_out)
      return { success: false, message: "Sudah clock out hari ini" };

    await ctx.db.patch(record._id, { clock_out: Date.now() });
    return { success: true, message: "Clock out berhasil" };
  },
});

// ─── Get Attendance for Date ────────────────────────────────
export const getAttendanceByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("staff_attendance")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    return await Promise.all(
      records.map(async (r) => {
        const user = await ctx.db.get(r.user_id);
        return { ...r, userName: user?.name ?? "Unknown" };
      }),
    );
  },
});

// ─── Get My Attendance ──────────────────────────────────────
export const getMyAttendance = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("staff_attendance")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .order("desc")
      .collect();
  },
});
