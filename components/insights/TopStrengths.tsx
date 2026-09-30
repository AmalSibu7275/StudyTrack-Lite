"use client";

import {
  Award,
  Clock3,
  Brain,
  CalendarDays,
} from "lucide-react";

import type { Session } from "./useInsights";

interface TopStrengthsProps {
  sessions: Session[];
  loading?: boolean;
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

export default function TopStrengths({
  sessions,
  loading = false,
}: TopStrengthsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
        <h2 className="text-2xl font-bold">Top Strengths</h2>
        <p className="text-gray-500 text-sm mt-1">
          Your strongest study habits
        </p>

        <div className="mt-8 space-y-5 animate-pulse">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-5 bg-gray-200 rounded w-32 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const scoredSessions = sessions.filter(
    (session) => Number.isFinite(Number(session.productivityScore))
  );

  // Best Session Type
  const typeTotals: Record<string, { total: number; count: number }> = {};

  scoredSessions.forEach((session) => {
    const type = session.sessionType || "Unknown";

    if (!typeTotals[type]) {
      typeTotals[type] = {
        total: 0,
        count: 0,
      };
    }

    typeTotals[type].total += Number(session.productivityScore) || 0;
    typeTotals[type].count++;
  });

  let bestType = "N/A";
  let bestAverage = 0;

  Object.entries(typeTotals).forEach(([type, data]) => {
    if (data.count === 0) return;

    const avg = data.total / data.count;

    if (avg > bestAverage) {
      bestAverage = avg;
      bestType = type;
    }
  });

  // Best Day
  const dayTotals: Record<string, { total: number; count: number }> = {};

  scoredSessions.forEach((session) => {
    const date = getSessionDate(session.createdAt);

    if (!date) return;

    const day = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (!dayTotals[day]) {
      dayTotals[day] = {
        total: 0,
        count: 0,
      };
    }

    dayTotals[day].total += Number(session.productivityScore) || 0;
    dayTotals[day].count++;
  });

  let bestDay = "N/A";
  let bestDayAverage = 0;

  Object.entries(dayTotals).forEach(([day, data]) => {
    if (data.count === 0) return;

    const avg = data.total / data.count;

    if (avg > bestDayAverage) {
      bestDayAverage = avg;
      bestDay = day;
    }
  });

  // Average Duration
  const averageDuration =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum, session) => sum + (Number(session.duration) || 0),
            0
          ) / sessions.length
        )
      : 0;

  // Highest Focus
  const highestFocus =
    scoredSessions.length > 0
      ? Math.max(
          ...scoredSessions.map(
            (session) => Number(session.productivityScore) || 0
          )
        )
      : 0;

  const items = [
    {
      icon: Award,
      color: "bg-yellow-100 text-yellow-600",
      title: "Best Session",
      value: bestType,
    },
    {
      icon: CalendarDays,
      color: "bg-green-100 text-green-600",
      title: "Best Day",
      value: bestDay,
    },
    {
      icon: Clock3,
      color: "bg-blue-100 text-blue-600",
      title: "Avg Duration",
      value: `${averageDuration} min`,
    },
    {
      icon: Brain,
      color: "bg-purple-100 text-purple-600",
      title: "Highest Focus",
      value: `${highestFocus}/10`,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <h2 className="text-2xl font-bold">Top Strengths</h2>

      <p className="text-gray-500 text-sm mt-1">
        Your strongest study habits
      </p>

      {sessions.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
          No sessions available for this date range.
        </div>
      ) : (
        <>
          <div className="space-y-5 mt-8">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {item.title}
                    </p>

                    <h4 className="font-semibold text-lg">
                      {item.value}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-blue-50 p-4">
            <p className="text-sm text-blue-700 leading-6">
              Your strongest performance comes from{" "}
              <strong>{bestType}</strong> sessions,
              {bestDay !== "N/A" && (
                <>
                  {" "}especially on <strong>{bestDay}</strong>.
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}