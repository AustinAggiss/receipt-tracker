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

    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
    
    return await Promise.all(
      receipts.map(async (receipt) => {
        const merchant = await ctx.db.get(receipt.merchantId);
        const imageUrls = await Promise.all(
          receipt.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return { id: imageId, url };
          })
        );
        
        return {
          ...receipt,
          merchant: merchant?.name || "Unknown",
          images: imageUrls,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    merchantId: v.id("merchants"),
    purchaseDate: v.string(),
    invoiceTotal: v.number(),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("receipts", {
      ...args,
      userId,
    });
  },
});

export const search = query({
  args: { query: v.optional(v.string()), date: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    const searchQuery = (args.query || "").toLowerCase();
    const dateFilter = args.date || "";
    const filteredReceipts = [];

    for (const receipt of receipts) {
      // If a date filter is provided, require an exact match
      if (dateFilter && receipt.purchaseDate !== dateFilter) continue;

      const merchant = await ctx.db.get(receipt.merchantId);
      const merchantName = merchant?.name || "";

      // If a text query is provided, require the text to match merchant, date, or total
      const matchesText = !searchQuery ||
        merchantName.toLowerCase().includes(searchQuery) ||
        receipt.purchaseDate.includes(searchQuery) ||
        receipt.invoiceTotal.toString().includes(searchQuery);

      if (matchesText) {
        const imageUrls = await Promise.all(
          receipt.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return { id: imageId, url };
          })
        );

        filteredReceipts.push({
          ...receipt,
          merchant: merchantName,
          images: imageUrls,
        });
      }
    }

    return filteredReceipts.sort((a, b) =>
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});
