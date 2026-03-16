import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Helper: generate unique 7-digit card ID ────────────────
async function generateUniqueCardId(ctx: any): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(1000000 + Math.random() * 9000000);
    const cardId = num.toString();
    const existing = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("card_id"), cardId))
      .first();
    if (!existing) return cardId;
  }
  throw new Error("Gagal generate Card ID unik, coba lagi");
}

// ─── Register ───────────────────────────────────────────────
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (existing) throw new Error("Email sudah terdaftar");

    const card_id =
      args.role === "student" ? await generateUniqueCardId(ctx) : undefined;

    const _id = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: args.role,
      type: args.type,
      card_id,
      is_active: true,
    });

    return { _id, card_id };
  },
});

// ─── Login ──────────────────────────────────────────────────
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    device: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    if (!user) throw new Error("User tidak ditemukan");
    if (user.password !== args.password) throw new Error("Password salah");
    if (!user.is_active) throw new Error("Akun tidak aktif");

    await ctx.db.insert("login_logs", {
      user_id: user._id,
      name: user.name,
      role: user.role,
      logged_in_at: Date.now(),
      date: new Date().toISOString().split("T")[0],
      device: args.device ?? "unknown",
    });

    return {
      _id: user._id,
      name: user.name,
      role: user.role,
      type: user.type,
      card_id: user.card_id,
    };
  },
});

// ─── Get Current User ───────────────────────────────────────
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      type: user.type,
      card_id: user.card_id,
      is_active: user.is_active,
    };
  },
});

// ─── Get All Users (admin) ──────────────────────────────────
export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      type: u.type,
      card_id: u.card_id,
      is_active: u.is_active,
    }));
  },
});

// ─── Get Students ───────────────────────────────────────────
export const getStudents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "student"))
      .collect();
  },
});

// ─── Get Staff ──────────────────────────────────────────────
export const getStaff = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "staff"))
      .collect();
  },
});

// ─── Get Login Logs Hari Ini (real-time) ────────────────────
export const getTodayLoginLogs = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    return await ctx.db
      .query("login_logs")
      .filter((q) => q.eq(q.field("date"), today))
      .order("desc")
      .collect();
  },
});

// ─── Get Semua Login Logs (admin, max 100) ──────────────────
export const getAllLoginLogs = query({
  handler: async (ctx) => {
    return await ctx.db.query("login_logs").order("desc").take(100);
  },
});

// ─── Get Login Logs by User ─────────────────────────────────
export const getLoginLogsByUser = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("login_logs")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .order("desc")
      .take(20);
  },
});
