import { useState, useRef, useEffect } from "react";
    import { useQuery, useMutation } from "convex/react";
    import { api } from "../../convex/_generated/api";
    import { Id } from "../../convex/_generated/dataModel";

    interface MerchantSelectorProps {
      selectedMerchantId: Id<"merchants"> | null;
      onMerchantSelect: (merchantId: Id<"merchants">) => void;
    }

    export function MerchantSelector({ selectedMerchantId, onMerchantSelect }: MerchantSelectorProps) {
      const [isOpen, setIsOpen] = useState(false);
      const [searchQuery, setSearchQuery] = useState("");
      const [inputValue, setInputValue] = useState("");
      
      const dropdownRef = useRef<HTMLDivElement>(null);
      const inputRef = useRef<HTMLInputElement>(null);
      
      const merchants = useQuery(api.merchants.list) || [];
      const searchResults = useQuery(api.merchants.search, 
        searchQuery ? { query: searchQuery } : "skip"
      ) || [];
      const createMerchant = useMutation(api.merchants.create);
      
      const displayedMerchants = searchQuery ? searchResults : merchants;
      const selectedMerchant = merchants.find(m => m._id === selectedMerchantId);

      useEffect(() => {
        if (selectedMerchant) {
          setInputValue(selectedMerchant.name);
        }
      }, [selectedMerchant]);

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
            setSearchQuery("");
            if (selectedMerchant) {
              setInputValue(selectedMerchant.name);
            }
          }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [selectedMerchant]);

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setSearchQuery(value);
        setIsOpen(true);
      };

      const handleMerchantSelect = (merchant: { _id: Id<"merchants">; name: string }) => {
        onMerchantSelect(merchant._id);
        setInputValue(merchant.name);
        setIsOpen(false);
        setSearchQuery("");
      };

      const handleCreateMerchant = async () => {
        if (!inputValue.trim()) return;
        
        try {
          const merchantId = await createMerchant({ name: inputValue.trim() });
          onMerchantSelect(merchantId);
          setIsOpen(false);
          setSearchQuery("");
        } catch (error) {
          console.error("Failed to create merchant:", error);
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputValue && !displayedMerchants.some(m => m.name.toLowerCase() === inputValue.toLowerCase())) {
          e.preventDefault();
          handleCreateMerchant();
        }
      };

      return (
        <div className="relative" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search or add new merchant..."
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {displayedMerchants.length > 0 ? (
                displayedMerchants.map((merchant) => (
                  <button
                    key={merchant._id}
                    type="button"
                    onClick={() => handleMerchantSelect(merchant)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none"
                  >
                    {merchant.name}
                  </button>
                ))
              ) : inputValue ? (
                <button
                  type="button"
                  onClick={handleCreateMerchant}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none text-blue-600"
                >
                  + Add "{inputValue}"
                </button>
              ) : (
                <div className="px-3 py-2 text-gray-500 dark:text-gray-400">No merchants found</div>
              )}
            </div>
          )}
        </div>
      );
    }
