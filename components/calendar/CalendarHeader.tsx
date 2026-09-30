"use client";

import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

type Props = {
  currentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function CalendarHeader({
  currentMonth,
  onPrevious,
  onNext,
  onToday,
}: Props) {
  const monthName =
    currentMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div className="p-5 border-b border-gray-100">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl accent-light-bg flex items-center justify-center">
            <CalendarDays
              size={20}
              className="accent-text"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {monthName}
            </h2>

            <p className="text-sm text-gray-500">
              Your study activity
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={onToday}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
          >
            Today
          </button>

          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous month"
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next month"
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          >
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}