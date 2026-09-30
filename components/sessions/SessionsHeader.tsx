"use client";

import {
  Download,
  Search,
  X,
} from "lucide-react";

type Props = {
  search: string;
  setSearch: (value: string) => void;

  dateRange: "all" | "week" | "month";

  setDateRange: (
    value: "all" | "week" | "month"
  ) => void;
};

export default function SessionsHeader({
  search,
  setSearch,
  dateRange,
  setDateRange,
}: Props) {
  function exportSessions() {
    window.print();
  }

  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sessions
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Track, review, and organize your completed study sessions.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) =>
            setDateRange(
              e.target.value as
                | "all"
                | "week"
                | "month"
            )
          }
          className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="all">
            All Sessions
          </option>

          <option value="week">
            Last 7 Days
          </option>

          <option value="month">
            Last 30 Days
          </option>
        </select>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search sessions..."
            aria-label="Search sessions"
            className="h-10 w-64 rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Export */}
        <button
          type="button"
          onClick={exportSessions}
          className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <Download size={16} />
          Export
        </button>

      </div>

    </div>
  );
}