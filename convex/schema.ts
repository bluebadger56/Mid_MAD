import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users (mahasiswa & staff dining) ─────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(), // "student" | "staff" | "admin"
    card_id: v.optional(v.string()), // ID kartu makan
    type: v.string(), // "insider" (anak asrama) | "outsider"
    is_active: v.boolean(),
  }),

  // ─── Meal Scans (riwayat scan kartu makan) ───────────────
  meal_scans: defineTable({
    user_id: v.id("users"),
    meal_type: v.string(), // "breakfast" | "lunch" | "dinner"
    date: v.string(), // "YYYY-MM-DD"
    scanned_at: v.number(), // timestamp
  }),

  // ─── Staff Attendance (absen worker dining) ───────────────
  staff_attendance: defineTable({
    user_id: v.id("users"),
    date: v.string(),
    clock_in: v.optional(v.number()),
    clock_out: v.optional(v.number()),
    status: v.string(), // "present" | "absent" | "late"
  }),

  // ─── Inventory (stok barang & bahan) ──────────────────────
  inventory_items: defineTable({
    name: v.string(),
    unit: v.string(), // "kg" | "liter" | "pcs" | "pack"
    current_stock: v.number(),
  }),

  inventory_transactions: defineTable({
    item_id: v.id("inventory_items"),
    type: v.string(), // "in" | "out"
    quantity: v.number(),
    date: v.string(),
    note: v.optional(v.string()),
  }),

  // ─── Weekly Menu ──────────────────────────────────────────
  weekly_menus: defineTable({
    day: v.string(), // "monday" | "tuesday" | ... | "sunday"
    meal_type: v.string(), // "breakfast" | "lunch" | "dinner"
    menu_name: v.string(),
    description: v.optional(v.string()),
    week_start: v.string(), // "YYYY-MM-DD" tanggal Senin minggu itu
  }),

  // ─── Feedback (kritik & saran) ────────────────────────────
  feedback: defineTable({
    user_id: v.id("users"),
    category: v.string(), // "menu" | "service" | "facility" | "other"
    message: v.string(),
    rating: v.number(), // 1-5
    date: v.string(),
  }),
});
