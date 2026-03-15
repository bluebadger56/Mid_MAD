import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper untuk mendapatkan waktu WITA (UTC+8)
const getWITA = () => {
  const now = new Date();
  // Offset WITA adalah 8 jam
  const witaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return {
    date: witaTime.toISOString().split("T")[0], // Format: YYYY-MM-DD
    hour: witaTime.getUTCHours(), // Jam dalam WITA
    timestamp: now.getTime()
  };
};

export const scanMakan = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const { date, hour } = getWITA();

    // Logika Jadwal Makan Siang 12:00 - 13:00 WITA
    if (hour !== 14) {
      return { 
        success: false, 
        message: `Di luar jadwal makan Siang (12:00 - 13:00). Sekarang jam ${hour}:00 WITA.` 
      };
    }

    const existing = await ctx.db
      .query("staff_attendance")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("date"), date),
          q.eq(q.field("type"), "lunch")
        )
      )
      .first();

    if (existing) return { success: false, message: "Kamu sudah scan makan siang hari ini." };

    // PERBAIKAN DI SINI: Ganti 'timestamp' menjadi 'clock_in'
    await ctx.db.insert("staff_attendance", {
      user_id: args.user_id,
      date: date,
      type: "lunch",
      clock_in: Date.now(), // Gunakan field yang dikenali database
    });

    return { success: true, message: "Scan makan siang berhasil! Selamat makan." };
  },
});
// ─── Clock In ───────────────────────────────────────────────
export const clockIn = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const { date, hour, timestamp } = getWITA();

    const existing = await ctx.db
      .query("staff_attendance")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("date"), date),
          q.eq(q.field("type"), "attendance") // Tambahkan pembeda jika satu tabel
        ),
      )
      .first();

    if (existing) return { success: false, message: "Sudah clock in hari ini" };

    // Batas masuk jam 07:00 WITA
    const status = hour > 7 ? "late" : "present";

    await ctx.db.insert("staff_attendance", {
      user_id: args.user_id,
      date: date,
      clock_in: timestamp,
      status,
      type: "attendance"
    });

    return { success: true, message: `Clock in berhasil (${status}) pada ${hour}:00 WITA` };
  },
});

// ─── Clock Out ──────────────────────────────────────────────
export const clockOut = mutation({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const { date, timestamp } = getWITA();

    const record = await ctx.db
      .query("staff_attendance")
      .filter((q) =>
        q.and(
          q.eq(q.field("user_id"), args.user_id),
          q.eq(q.field("date"), date),
          q.eq(q.field("type"), "attendance")
        ),
      )
      .first();

    if (!record) return { success: false, message: "Belum clock in hari ini" };
    if (record.clock_out) return { success: false, message: "Sudah clock out hari ini" };

    await ctx.db.patch(record._id, { clock_out: timestamp });
    return { success: true, message: "Clock out berhasil (WITA)" };
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