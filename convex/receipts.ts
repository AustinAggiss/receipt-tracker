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
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const receipts = await ctx.db
      .query("receipts")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    
    const searchQuery = args.query.toLowerCase();
    const filteredReceipts = [];
    
    for (const receipt of receipts) {
      const merchant = await ctx.db.get(receipt.merchantId);
      const merchantName = merchant?.name || "";
      
      // Search by merchant name, date, or total
      const matchesMerchant = merchantName.toLowerCase().includes(searchQuery);
      const matchesDate = receipt.purchaseDate.includes(searchQuery);
      const matchesTotal = receipt.invoiceTotal.toString().includes(searchQuery);
      
      if (matchesMerchant || matchesDate || matchesTotal) {
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
