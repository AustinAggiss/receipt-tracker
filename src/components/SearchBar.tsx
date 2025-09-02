import { useState } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value; // YYYY-MM-DD
    onSearchChange(date);
    setShowDatePicker(false);
  };

  const clearSearch = () => {
    onSearchChange("");
    setShowDatePicker(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search receipts by merchant, date, or amount..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Right-side controls: date toggle + clear */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <button
          type="button"
          title="Filter by date"
          onClick={() => setShowDatePicker((s) => !s)}
          className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        <button
          type="button"
          title="Clear search"
          onClick={clearSearch}
          className="p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {showDatePicker && (
        <div className="absolute right-0 mt-12 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow">
          <label className="sr-only">Filter by date</label>
          <input
            type="date"
            onChange={handleDateChange}
            className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 outline-none"
          />
        </div>
      )}
    </div>
  );
}
