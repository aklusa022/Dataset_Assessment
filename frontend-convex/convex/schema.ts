import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  datasets: defineTable({
    name: v.string(),
    domain: v.string(),
    owner: v.string(),
    qualityScore: v.number(),
    status: v.union(
      v.literal("Approved"),
      v.literal("NeedsReview"),
      v.literal("Rejected")
    ),
  }),
});
