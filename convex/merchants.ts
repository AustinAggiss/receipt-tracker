import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("merchants")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if merchant already exists for this user
    const existing = await ctx.db
      .query("merchants")
      .filter((q) => q.and(
        q.eq(q.field("userId"), userId),
        q.eq(q.field("name"), args.name)
      ))
      .unique();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("merchants", { 
      name: args.name,
      userId,
    });
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const merchants = await ctx.db
      .query("merchants")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    return merchants.filter(merchant => 
      merchant.name.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
