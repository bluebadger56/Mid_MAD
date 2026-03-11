import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Submit Feedback ────────────────────────────────────────
export const submitFeedback = mutation({
  args: {
    user_id: v.id("users"),
    category: v.string(),
    message: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("feedback", {
      user_id: args.user_id,
      category: args.category,
      message: args.message,
      rating: args.rating,
      date: new Date().toISOString().split("T")[0],
    });
  },
});

// ─── Get All Feedback ───────────────────────────────────────
export const getAllFeedback = query({
  handler: async (ctx) => {
    const feedbacks = await ctx.db.query("feedback").order("desc").collect();
    return await Promise.all(
      feedbacks.map(async (f) => {
        const user = await ctx.db.get(f.user_id);
        return { ...f, userName: user?.name ?? "Anonim" };
      }),
    );
  },
});

// ─── Get Feedback by Category ───────────────────────────────
export const getFeedbackByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const feedbacks = await ctx.db
      .query("feedback")
      .filter((q) => q.eq(q.field("category"), args.category))
      .order("desc")
      .collect();

    return await Promise.all(
      feedbacks.map(async (f) => {
        const user = await ctx.db.get(f.user_id);
        return { ...f, userName: user?.name ?? "Anonim" };
      }),
    );
  },
});

// ─── Get Feedback Summary ───────────────────────────────────
export const getFeedbackSummary = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("feedback").collect();
    const categories = ["menu", "service", "facility", "other"];
    return categories.map((cat) => {
      const catFeedback = all.filter((f) => f.category === cat);
      const avgRating =
        catFeedback.length > 0
          ? catFeedback.reduce((sum, f) => sum + f.rating, 0) /
            catFeedback.length
          : 0;
      return {
        category: cat,
        count: catFeedback.length,
        avgRating: Math.round(avgRating * 10) / 10,
      };
    });
  },
});
