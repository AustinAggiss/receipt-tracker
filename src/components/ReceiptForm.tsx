import { useState, useRef } from "react";
    import { useMutation, useQuery } from "convex/react";
    import { api } from "../../convex/_generated/api";
    import { toast } from "sonner";
    import { MerchantSelector } from "./MerchantSelector";
    import { Id } from "../../convex/_generated/dataModel";

    interface ReceiptFormProps {
      onSuccess: () => void;
    }

    export function ReceiptForm({ onSuccess }: ReceiptFormProps) {
      const [merchantId, setMerchantId] = useState<Id<"merchants"> | null>(null);
      const [purchaseDate, setPurchaseDate] = useState("");
      const [invoiceTotal, setInvoiceTotal] = useState("");
      const [selectedImages, setSelectedImages] = useState<File[]>([]);
      const [isSubmitting, setIsSubmitting] = useState(false);
      
      const fileInputRef = useRef<HTMLInputElement>(null);
      
      const createReceipt = useMutation(api.receipts.create);
      const generateUploadUrl = useMutation(api.receipts.generateUploadUrl);

      const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(prev => [...prev, ...files]);
      };

      const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
      };

      const uploadImages = async (images: File[]): Promise<Id<"_storage">[]> => {
        const uploadPromises = images.map(async (image) => {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
          });
          
          if (!result.ok) {
            throw new Error(`Failed to upload ${image.name}`);
          }
          
          const { storageId } = await result.json();
          return storageId;
        });
        
        return await Promise.all(uploadPromises);
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!merchantId || !purchaseDate || !invoiceTotal) {
          toast.error("Please fill in all required fields");
          return;
        }

        setIsSubmitting(true);
        
        try {
          const imageIds = selectedImages.length > 0 
            ? await uploadImages(selectedImages)
            : [];
          
          await createReceipt({
            merchantId,
            purchaseDate,
            invoiceTotal: parseFloat(invoiceTotal),
            imageIds,
          });
          
          toast.success("Receipt added successfully!");
          
          // Reset form
          setMerchantId(null);
          setPurchaseDate("");
          setInvoiceTotal("");
          setSelectedImages([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          
          onSuccess();
        } catch (error) {
          toast.error("Failed to add receipt");
          console.error(error);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Receipt</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Merchant *
              </label>
              <MerchantSelector
                selectedMerchantId={merchantId}
                onMerchantSelect={setMerchantId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Invoice Total *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={invoiceTotal}
                onChange={(e) => setInvoiceTotal(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Receipt Images
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              
              {selectedImages.length > 0 && (
                <div className="mt-2 space-y-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding..." : "Add Receipt"}
              </button>
            </div>
          </form>
        </div>
      );
    }
