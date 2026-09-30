"use client";

import { Clock3 } from "lucide-react";
import type { Session } from "./useInsights";

interface ProductivityByTimeProps {
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

export default function ProductivityByTime({
  sessions,
  loading = false,
}: ProductivityByTimeProps) {
  const periods = [
    { label: "Morning", start: 5, end: 11 },
    { label: "Afternoon", start: 12, end: 16 },
    { label: "Evening", start: 17, end: 21 },
    { label: "Night", start: 22, end: 4 },
  ];

  const data = periods.map((period) => {
    const filtered = sessions.filter((session) => {
      const date = getSessionDate(session.createdAt);

      if (!date) return false;

      const hour = date.getHours();

      if (period.label === "Night") {
        return hour >= 22 || hour <= 4;
      }

      return hour >= period.start && hour <= period.end;
    });

    const average =
      filtered.length === 0
        ? 0
        : filtered.reduce(
            (sum, session) =>
              sum + (Number(session.productivityScore) || 0),
            0
          ) / filtered.length;

    return {
      ...period,
      score: average,
      count: filtered.length,
    };
  });

  const periodsWithData = data.filter((item) => item.count > 0);

  const best =
    periodsWithData.length > 0
      ? periodsWithData.reduce((a, b) =>
          a.score > b.score ? a : b
        )
      : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Clock3 className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Productivity by Time
          </h2>

          <p className="text-sm text-gray-500">
            Average focus throughout the day
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 mt-8 animate-pulse">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>

              <div className="h-3 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-500">
          No sessions available for this date range.
        </div>
      ) : (
        <>
          <div className="space-y-6 mt-8">
            {data.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {item.label}
                  </span>

                  <span className="text-gray-500">
                    {item.score.toFixed(1)}/10
                  </span>
                </div>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(item.score * 10, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-blue-50 p-5">
            {best ? (
              <p className="text-blue-700 leading-6">
                Your strongest study period is{" "}
                <strong>{best.label}</strong> with an average focus score
                of <strong>{best.score.toFixed(1)}/10</strong>.
              </p>
            ) : (
              <p className="text-blue-700 leading-6">
                Not enough timestamped sessions to determine your strongest
                study period.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}