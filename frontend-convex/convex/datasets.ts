import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("datasets").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    domain: v.string(),
    owner: v.string(),
    qualityScore: v.number(),
    status: v.union(
      v.literal("Approved"),
      v.literal("NeedsReview"),
      v.literal("Rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("datasets", args);
  },
});
