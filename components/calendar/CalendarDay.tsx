"use client";

import { CalendarDayData } from "./Calendar";

type Props = {
  date: Date;
  data?: CalendarDayData;
  selected: boolean;
  onClick: () => void;
};

export default function CalendarDay({
  date,
  data,
  selected,
  onClick,
}: Props) {
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const totalMinutes =
    data?.totalMinutes ?? 0;

  const productivity =
    data?.averageProductivity ?? 0;

  function getProductivityClass() {
    if (productivity >= 8) {
      return "bg-green-100 text-green-700";
    }

    if (productivity >= 6) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (productivity > 0) {
      return "bg-red-100 text-red-700";
    }

    return "";
  }

  function formatHours() {
    if (totalMinutes === 0) {
      return "";
    }

    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        min-h-[120px]
        p-3
        text-left
        border-r border-b border-gray-100
        transition
        hover:bg-gray-50
        focus:outline-none
        focus:ring-2
        focus:ring-inset
        focus:ring-blue-500
        ${selected ? "bg-blue-50/60" : ""}
      `}
    >

      {/* Date */}

      <div className="flex items-center justify-between">

        <span
          className={`
            w-8 h-8
            flex items-center justify-center
            rounded-full
            text-sm
            font-semibold
            ${
              isToday
                ? "accent-bg text-white"
                : selected
                ? "accent-text"
                : "text-gray-700"
            }
          `}
        >
          {date.getDate()}
        </span>

        {data &&
          data.sessions.length > 0 && (
            <span className="text-xs text-gray-400">
              {data.sessions.length}
            </span>
          )}

      </div>

      {/* Session information */}

      {data &&
      data.sessions.length > 0 ? (
        <div className="mt-4 space-y-2">

          <div className="text-sm font-semibold text-gray-700">
            {formatHours()}
          </div>

          <div className="flex items-center gap-2">

            {productivity > 0 && (
              <span
                className={`
                  inline-flex
                  items-center
                  rounded-lg
                  px-2
                  py-1
                  text-xs
                  font-medium
                  ${getProductivityClass()}
                `}
              >
                {productivity.toFixed(1)}
              </span>
            )}

            <span className="text-xs text-gray-400">
              avg. focus
            </span>

          </div>

        </div>
      ) : (
        <div className="mt-5 text-xs text-gray-300">
          No study sessions
        </div>
      )}

    </button>
  );
}