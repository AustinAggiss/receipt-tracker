import { useQuery } from "convex/react";
    import { api } from "../../convex/_generated/api";

    interface ReceiptListProps {
      searchQuery: string;
    }

    export function ReceiptList({ searchQuery }: ReceiptListProps) {
      const allReceipts = useQuery(api.receipts.list);
      const searchResults = useQuery(api.receipts.search, 
        searchQuery ? { query: searchQuery } : "skip"
      );
      
      const receipts = searchQuery ? searchResults : allReceipts;

      if (receipts === undefined) {
        return (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      if (receipts.length === 0) {
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              {searchQuery ? "No receipts found" : "No receipts yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "Try adjusting your search terms" : "Add your first receipt to get started"}
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {searchQuery ? `Search Results (${receipts.length})` : `All Receipts (${receipts.length})`}
          </h2>
          
          <div className="grid gap-4 group transition-all duration-300 ease-in-out">
            {receipts.map((receipt) => (
              <div key={receipt._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{receipt.merchant}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{new Date(receipt.purchaseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-500">${receipt.invoiceTotal.toFixed(2)}</p>
                  </div>
                </div>
                
                {receipt.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Receipt Images:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {receipt.images.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url || ""}
                            alt={`Receipt ${index + 1}`}
                            className="w-full h-24 object-cover rounded border dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() => window.open(image.url || "", "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="hidden group-hover:block text-right align-text-bottom transition-all duration-300 ease-in-out">
                      <button className="text-gray-100 px-4 py-2 rounded-lg text-l bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 bg-opacity-85">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
