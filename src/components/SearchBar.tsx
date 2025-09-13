import { useState, useEffect } from "react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter?: string;
  onDateFilterChange?: (date: string) => void;
}

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function formatReadableDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    // fallback to the raw iso string if invalid
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
  } catch {
    return iso;
  }
}

export function SearchBar({ searchQuery, onSearchChange, dateFilter = "", onDateFilterChange }: SearchBarProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  // local date buffer so picking a date does NOT immediately run the search
  const [dateValue, setDateValue] = useState("");

  useEffect(() => {
    // when opening the date picker, prefer the explicit dateFilter; fallback to searchQuery if it looks like a date
    if (showDatePicker) {
      if (dateFilter && isISODate(dateFilter)) {
        setDateValue(dateFilter);
      } else if (isISODate(searchQuery)) {
        setDateValue(searchQuery);
      } else {
        setDateValue("");
      }
    }
  }, [showDatePicker, searchQuery, dateFilter]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value); // buffer the picked date
  };

  const applyDateFilter = () => {
    // apply date alongside the existing text query
    if (onDateFilterChange) {
      onDateFilterChange(dateValue || "");
    }
    setShowDatePicker(false);
  };

  const cancelDateFilter = () => {
    setShowDatePicker(false);
    setDateValue("");
  };

  const clearSearch = () => {
    onSearchChange("");
    if (onDateFilterChange) onDateFilterChange("");
    setShowDatePicker(false);
    setDateValue("");
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by merchant, date, or amount..."
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
        {/* Active date pill */}
        {dateFilter ? (
          <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 dark:bg-blue-900/50 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200">
            <span>{formatReadableDate(dateFilter)}</span>
            <button
              type="button"
              aria-label="Clear date filter"
              onClick={() => onDateFilterChange?.("")}
              className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : null}
        <button
          type="button"
          title="Filter by date"
          onClick={() => setShowDatePicker((s) => !s)}
          className={`p-1 rounded ${dateFilter ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"} hover:bg-gray-200 dark:hover:bg-gray-600`}
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
        <div className="absolute z-10 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <label className="sr-only">Filter by date</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateValue}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={applyDateFilter}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={cancelDateFilter}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
