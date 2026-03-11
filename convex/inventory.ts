import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Get All Items ──────────────────────────────────────────
export const getItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("inventory_items").order("asc").collect();
  },
});

// ─── Add Item ───────────────────────────────────────────────
export const addItem = mutation({
  args: {
    name: v.string(),
    unit: v.string(),
    current_stock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inventory_items", {
      name: args.name,
      unit: args.unit,
      current_stock: args.current_stock,
    });
  },
});

// ─── Record Stock In/Out ────────────────────────────────────
export const recordTransaction = mutation({
  args: {
    item_id: v.id("inventory_items"),
    type: v.string(), // "in" | "out"
    quantity: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.item_id);
    if (!item) throw new Error("Item tidak ditemukan");

    const newStock =
      args.type === "in"
        ? item.current_stock + args.quantity
        : item.current_stock - args.quantity;

    if (newStock < 0) throw new Error("Stok tidak cukup");

    await ctx.db.patch(args.item_id, { current_stock: newStock });
    await ctx.db.insert("inventory_transactions", {
      item_id: args.item_id,
      type: args.type,
      quantity: args.quantity,
      date: new Date().toISOString().split("T")[0],
      note: args.note,
    });

    return { newStock };
  },
});

// ─── Get Transactions for Item ──────────────────────────────
export const getTransactions = query({
  args: { item_id: v.id("inventory_items") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inventory_transactions")
      .filter((q) => q.eq(q.field("item_id"), args.item_id))
      .order("desc")
      .collect();
  },
});

// ─── Get Stock Summary (in vs out comparison) ───────────────
export const getStockSummary = query({
  handler: async (ctx) => {
    const items = await ctx.db.query("inventory_items").collect();
    const transactions = await ctx.db.query("inventory_transactions").collect();

    return items.map((item) => {
      const itemTx = transactions.filter((t) => t.item_id === item._id);
      const totalIn = itemTx
        .filter((t) => t.type === "in")
        .reduce((s, t) => s + t.quantity, 0);
      const totalOut = itemTx
        .filter((t) => t.type === "out")
        .reduce((s, t) => s + t.quantity, 0);
      return {
        ...item,
        totalIn,
        totalOut,
        isBalanced: totalIn - totalOut === item.current_stock,
      };
    });
  },
});

// ─── Delete Item ────────────────────────────────────────────
export const deleteItem = mutation({
  args: { id: v.id("inventory_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
