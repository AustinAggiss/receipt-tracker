import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  merchants: defineTable({
    name: v.string(),
    userId: v.optional(v.id("users")),
  })
    .index("by_name", ["name"])
    .index("by_user", ["userId"]),
  
  receipts: defineTable({
    merchantId: v.id("merchants"),
    purchaseDate: v.string(), // YYYY-MM-DD format
    invoiceTotal: v.number(),
    imageIds: v.array(v.id("_storage")),
    userId: v.optional(v.id("users")),
  })
    .index("by_merchant", ["merchantId"])
    .index("by_date", ["purchaseDate"])
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "purchaseDate"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
