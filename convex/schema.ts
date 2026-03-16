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

  // ─── Login Logs (riwayat sign in real-time) ───────────────
  login_logs: defineTable({
    user_id: v.id("users"),
    name: v.string(), // nama user (untuk mudah dibaca di dashboard)
    role: v.string(), // "student" | "staff" | "admin"
    logged_in_at: v.number(), // timestamp ms
    date: v.string(), // "YYYY-MM-DD" untuk filter harian
    device: v.optional(v.string()),
  }),

  // ─── Meal Scans (riwayat scan kartu makan) ───────────────
  meal_scans: defineTable({
    user_id: v.id("users"),
    meal_type: v.string(), // "breakfast" | "lunch" | "dinner"
    date: v.string(), // "YYYY-MM-DD"
    scanned_at: v.number(), // timestamp
  }),

  // ─── Staff Attendance (absen worker dining) ───────────────
  // NOTE: type dibuat optional sementara untuk keperluan migration.
  // Setelah menjalankan migrations:fixStaffAttendanceType via Dashboard,
  // ubah kembali type menjadi v.string() (wajib).
  staff_attendance: defineTable({
    user_id: v.id("users"),
    date: v.string(),
    status: v.optional(v.string()), // "present" | "late"
    clock_in: v.optional(v.number()),
    clock_out: v.optional(v.number()),
    type: v.optional(v.string()), // ← SEMENTARA optional | "attendance" | "lunch"
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
