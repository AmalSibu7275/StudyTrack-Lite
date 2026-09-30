"use client";

import { CalendarDays } from "lucide-react";
import type { Session } from "./useInsights";

interface WeeklyConsistencyProps {
  sessions: Session[];
  loading?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

function getSessionDate(createdAt: any): Date | null {
  if (!createdAt) return null;

  if (createdAt?.toDate) {
    const date = createdAt.toDate();
    return date instanceof Date && !isNaN(date.getTime()) ? date : null;
  }

  if (createdAt instanceof Date) {
    return !isNaN(createdAt.getTime()) ? createdAt : null;
  }

  const date = new Date(createdAt);

  return !isNaN(date.getTime()) ? date : null;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WeeklyConsistency({
  sessions,
  loading = false,
  startDate = null,
  endDate = null,
}: WeeklyConsistencyProps) {
  const today = new Date();

  const effectiveStart = startDate
    ? new Date(startDate)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 27);

  const effectiveEnd = endDate
    ? new Date(endDate)
    : new Date(today);

  effectiveStart.setHours(0, 0, 0, 0);
  effectiveEnd.setHours(23, 59, 59, 999);

  const numberOfDays =
    Math.max(
      1,
      Math.floor(
        (effectiveEnd.getTime() - effectiveStart.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );

  const days = Array.from(
    { length: Math.min(numberOfDays, 42) },
    (_, index) => {
      const date = new Date(effectiveEnd);

      date.setHours(0, 0, 0, 0);

      date.setDate(
        effectiveEnd.getDate() -
          (Math.min(numberOfDays, 42) - 1 - index)
      );

      const count = sessions.filter((session) => {
        const sessionDate = getSessionDate(session.createdAt);

        return sessionDate
          ? sameDay(sessionDate, date)
          : false;
      }).length;

      return {
        date,
        count,
      };
    }
  );

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count === 1) return "bg-blue-200";
    if (count === 2) return "bg-blue-400";
    return "bg-blue-600";
  };

  const studiedDays = days.filter((day) => day.count > 0).length;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
          <CalendarDays className="text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Weekly Consistency
          </h2>

          <p className="text-sm text-gray-500">
            Study activity across the selected range
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-2 animate-pulse">
          {Array.from({ length: 28 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => (
              <div
                key={index}
                title={`${day.date.toLocaleDateString()} — ${day.count} session${
                  day.count === 1 ? "" : "s"
                }`}
                className={`aspect-square rounded-lg ${getColor(
                  day.count
                )}`}
              />
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-green-50 p-4">
            <p className="text-sm text-green-700">
              You studied on{" "}
              <strong>{studiedDays}</strong> of{" "}
              <strong>{days.length}</strong> tracked days.
            </p>
          </div>
        </>
      )}
    </div>
  );
}