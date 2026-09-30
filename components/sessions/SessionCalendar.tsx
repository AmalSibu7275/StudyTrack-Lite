"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
} from "lucide-react";

import { Session } from "./Sessions";

type Props = {
  sessions: Session[];
  onSelect: (session: Session) => void;
};

export default function SessionCalendar({
  sessions,
  onSelect,
}: Props) {
  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  /*
   * First day of month
   *
   * JS:
   * Sunday = 0
   * Monday = 1
   * ...
   *
   * We want Monday to be the first column.
   */
  const firstDayOfMonth = new Date(
    year,
    month,
    1
  ).getDay();

  const startingDay =
    firstDayOfMonth === 0
      ? 6
      : firstDayOfMonth - 1;

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  /*
   * Create calendar cells
   */
  const calendarDays = [];

  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  /*
   * Previous month
   */
  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  }

  /*
   * Next month
   */
  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  }

  /*
   * Today
   */
  function goToToday() {
    setCurrentDate(new Date());
  }

  /*
   * Convert Firestore timestamp/string/date
   * into a JavaScript Date.
   */
  function getDate(session: Session): Date | null {
    if (!session.createdAt) {
      return null;
    }

    try {
      if (
        typeof session.createdAt.toDate ===
        "function"
      ) {
        return session.createdAt.toDate();
      }

      const date = new Date(
        session.createdAt
      );

      if (isNaN(date.getTime())) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }

  /*
   * Sessions for each calendar day
   */
  const sessionsByDay = useMemo(() => {
    const map: Record<number, Session[]> = {};

    sessions.forEach((session) => {
      const date = getDate(session);

      if (!date) return;

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month
      ) {
        return;
      }

      const day = date.getDate();

      if (!map[day]) {
        map[day] = [];
      }

      map[day].push(session);
    });

    return map;
  }, [sessions, year, month]);

  /*
   * Check whether a date is today
   */
  function isToday(day: number) {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  }

  /*
   * Total minutes for a day
   */
  function getTotalMinutes(day: number) {
    return (sessionsByDay[day] || []).reduce(
      (total, session) =>
        total +
        (Number(session.duration) || 0),
      0
    );
  }

  /*
   * Average productivity for a day
   */
  function getAverageProductivity(day: number) {
    const daySessions =
      sessionsByDay[day] || [];

    if (daySessions.length === 0) {
      return 0;
    }

    const total = daySessions.reduce(
      (sum, session) =>
        sum +
        (Number(
          session.productivityScore
        ) || 0),
      0
    );

    return total / daySessions.length;
  }

  /*
   * Format minutes
   */
  function formatDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  /*
   * Productivity badge
   */
  function getProductivityClass(
    score: number
  ) {
    if (score >= 8) {
      return "bg-green-50 text-green-700";
    }

    if (score >= 6) {
      return "bg-yellow-50 text-yellow-700";
    }

    if (score > 0) {
      return "bg-red-50 text-red-700";
    }

    return "";
  }

  const weekdays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Calendar header */}

      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Session Calendar
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            View your study sessions by day.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Today
          </button>

          <button
            type="button"
            onClick={previousMonth}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="min-w-[135px] text-center">

            <p className="font-semibold text-sm text-gray-900">
              {monthName} {year}
            </p>

          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Next month"
          >
            <ChevronRight size={17} />
          </button>

        </div>

      </div>

      {/* Weekday header */}

      <div className="grid grid-cols-7 border-b border-gray-100">

        {weekdays.map((day) => (
          <div
            key={day}
            className="px-3 py-3 text-xs font-semibold text-gray-500 text-center"
          >
            {day}
          </div>
        ))}

      </div>

      {/* Calendar */}

      <div className="grid grid-cols-7">

        {calendarDays.map(
          (day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[145px] border-r border-b border-gray-100 bg-gray-50/40"
                />
              );
            }

            const daySessions =
              sessionsByDay[day] || [];

            const totalMinutes =
              getTotalMinutes(day);

            const averageProductivity =
              getAverageProductivity(day);

            const today = isToday(day);

            return (
              <div
                key={day}
                className={`min-h-[145px] p-2.5 border-r border-b border-gray-100 transition ${
                  today
                    ? "bg-blue-50/40"
                    : "bg-white"
                }`}
              >

                {/* Date */}

                <div className="flex items-center justify-between mb-2">

                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${
                      today
                        ? "bg-blue-600 text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>

                  {daySessions.length >
                    0 && (
                    <span className="text-[10px] text-gray-400">
                      {daySessions.length}{" "}
                      {daySessions.length ===
                      1
                        ? "session"
                        : "sessions"}
                    </span>
                  )}

                </div>

                {/* Study information */}

                {daySessions.length >
                0 ? (
                  <div className="space-y-1.5">

                    {/* Duration */}

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">

                      <Clock3 size={12} />

                      <span>
                        {formatDuration(
                          totalMinutes
                        )}
                      </span>

                    </div>

                    {/* Sessions */}

                    {daySessions
                      .slice(0, 3)
                      .map((session) => (
                        <button
                          type="button"
                          key={session.id}
                          onClick={() =>
                            onSelect(session)
                          }
                          className="w-full text-left rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 px-2 py-1.5 transition"
                        >

                          <p className="text-[11px] font-semibold text-blue-700 truncate">
                            {session.subject ||
                              session.taskName ||
                              "Study Session"}
                          </p>

                          <p className="text-[10px] text-blue-500 truncate">
                            {session.taskName ||
                              session.sessionType ||
                              "Study"}
                          </p>

                        </button>
                      ))}

                    {/* More sessions */}

                    {daySessions.length >
                      3 && (
                      <p className="text-[10px] text-gray-400 px-1">
                        +
                        {daySessions.length -
                          3}{" "}
                        more
                      </p>
                    )}

                    {/* Productivity */}

                    {averageProductivity >
                      0 && (
                      <div className="pt-1">

                        <span
                          className={`inline-flex px-2 py-1 rounded-md text-[10px] font-medium ${getProductivityClass(
                            averageProductivity
                          )}`}
                        >
                          {averageProductivity.toFixed(
                            1
                          )}
                          /10 focus
                        </span>

                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-[10px] text-gray-300 mt-5">
                    No sessions
                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

      {/* Legend */}

      <div className="flex flex-wrap items-center gap-5 px-5 py-4 border-t border-gray-100">

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-blue-600" />

          <span className="text-xs text-gray-500">
            Today
          </span>

        </div>

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded bg-blue-50 border border-blue-100" />

          <span className="text-xs text-gray-500">
            Study session
          </span>

        </div>

        <div className="text-xs text-gray-400 ml-auto">
          Click a session to view details
        </div>

      </div>

    </div>
  );
}