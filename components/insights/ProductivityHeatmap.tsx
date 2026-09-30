"use client";

import useInsights from "@/components/insights/useInsights";
import { Clock3 } from "lucide-react";

const days = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const timeSlots = [
  { label: "6 AM", start: 6, end: 9 },
  { label: "9 AM", start: 9, end: 12 },
  { label: "12 PM", start: 12, end: 15 },
  { label: "3 PM", start: 15, end: 18 },
  { label: "6 PM", start: 18, end: 21 },
  { label: "9 PM", start: 21, end: 24 },
  { label: "12 AM", start: 0, end: 6 },
];

type Cell = {
  totalScore: number;
  sessionCount: number;
};

function getSessionDate(
  createdAt: any
): Date | null {
  if (!createdAt) {
    return null;
  }

  try {
    if (
      typeof createdAt.toDate === "function"
    ) {
      const date = createdAt.toDate();

      return isNaN(date.getTime())
        ? null
        : date;
    }

    if (createdAt instanceof Date) {
      return isNaN(createdAt.getTime())
        ? null
        : createdAt;
    }

    const date = new Date(createdAt);

    return isNaN(date.getTime())
      ? null
      : date;
  } catch {
    return null;
  }
}

function getTimeSlot(hour: number) {
  if (hour >= 6 && hour < 9) return 0;
  if (hour >= 9 && hour < 12) return 1;
  if (hour >= 12 && hour < 15) return 2;
  if (hour >= 15 && hour < 18) return 3;
  if (hour >= 18 && hour < 21) return 4;
  if (hour >= 21 && hour < 24) return 5;

  return 6;
}

function getIntensity(
  averageScore: number,
  sessionCount: number
) {
  if (sessionCount === 0) {
    return "bg-gray-100";
  }

  if (averageScore < 4) {
    return "bg-purple-200";
  }

  if (averageScore < 6) {
    return "bg-purple-300";
  }

  if (averageScore < 7.5) {
    return "bg-purple-400";
  }

  if (averageScore < 9) {
    return "bg-purple-500";
  }

  return "bg-purple-700";
}

export default function ProductivityHeatmap() {
  const {
    sessions,
    loading,
  } = useInsights();

  /*
   * 7 time slots × 7 days
   */
  const grid: Cell[][] = Array.from(
    { length: 7 },
    () =>
      Array.from(
        { length: 7 },
        () => ({
          totalScore: 0,
          sessionCount: 0,
        })
      )
  );

  /*
   * Add each session to its
   * corresponding day/time cell.
   */
  sessions.forEach((session) => {
    const date = getSessionDate(
      session.createdAt
    );

    if (!date) {
      return;
    }

    const productivity = Number(
      session.productivityScore
    );

    if (
      !Number.isFinite(productivity) ||
      productivity <= 0
    ) {
      return;
    }

    const day = date.getDay();
    const row = getTimeSlot(
      date.getHours()
    );

    grid[row][day].totalScore +=
      productivity;

    grid[row][day].sessionCount += 1;
  });

  /*
   * Find the strongest productivity period.
   */
  let bestScore = 0;
  let bestDay = "";
  let bestTime = "";
  let bestCount = 0;

  grid.forEach((row, rowIndex) => {
    row.forEach((cell, dayIndex) => {
      if (cell.sessionCount === 0) {
        return;
      }

      const average =
        cell.totalScore /
        cell.sessionCount;

      if (average > bestScore) {
        bestScore = average;
        bestDay = days[dayIndex];
        bestTime =
          timeSlots[rowIndex].label;
        bestCount = cell.sessionCount;
      }
    });
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">

        <Clock3
          className="text-purple-600"
          size={22}
        />

        <div>
          <h2 className="text-2xl font-bold">
            Productivity by Time of Day
          </h2>

          <p className="text-gray-500 text-sm">
            Average productivity across your study sessions
          </p>
        </div>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading productivity data...
        </div>
      ) : (
        <>
          {/* Heatmap */}
          <div className="overflow-x-auto">

            <table className="w-full border-separate border-spacing-2">

              <thead>
                <tr>
                  <th></th>

                  {days.map((day) => (
                    <th
                      key={day}
                      className="text-xs text-gray-500 font-medium"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map(
                  (slot, rowIndex) => (
                    <tr key={slot.label}>

                      <td className="text-xs text-gray-500 pr-3 whitespace-nowrap">
                        {slot.label}
                      </td>

                      {grid[rowIndex].map(
                        (
                          cell,
                          colIndex
                        ) => {
                          const average =
                            cell.sessionCount >
                            0
                              ? cell.totalScore /
                                cell.sessionCount
                              : 0;

                          return (
                            <td
                              key={`${rowIndex}-${colIndex}`}
                            >
                              <div
                                title={
                                  cell.sessionCount >
                                  0
                                    ? `${days[colIndex]} ${slot.label} — ${average.toFixed(
                                        1
                                      )}/10 average (${cell.sessionCount} session${
                                        cell.sessionCount ===
                                        1
                                          ? ""
                                          : "s"
                                      })`
                                    : `${days[colIndex]} ${slot.label} — No sessions`
                                }
                                className={`w-9 h-9 rounded-lg transition-all hover:scale-110 ${getIntensity(
                                  average,
                                  cell.sessionCount
                                )}`}
                              />
                            </td>
                          );
                        }
                      )}

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-8 text-xs text-gray-500">

            <span>
              Lower Productivity
            </span>

            <div className="flex gap-2">

              <div className="w-5 h-5 rounded bg-gray-100" />
              <div className="w-5 h-5 rounded bg-purple-200" />
              <div className="w-5 h-5 rounded bg-purple-300" />
              <div className="w-5 h-5 rounded bg-purple-400" />
              <div className="w-5 h-5 rounded bg-purple-500" />
              <div className="w-5 h-5 rounded bg-purple-700" />

            </div>

            <span>
              Higher Productivity
            </span>

          </div>

          {/* Insight */}
          <div className="mt-8 rounded-2xl bg-purple-50 p-4">

            {bestScore > 0 ? (
              <p className="text-sm text-purple-700">
                💡 Your strongest productivity
                period is{" "}
                <strong>
                  {bestDay} around {bestTime}
                </strong>{" "}
                with an average productivity
                score of{" "}
                <strong>
                  {bestScore.toFixed(1)}/10
                </strong>{" "}
                across{" "}
                <strong>
                  {bestCount}
                </strong>{" "}
                session
                {bestCount === 1
                  ? ""
                  : "s"}.
              </p>
            ) : (
              <p className="text-sm text-purple-700">
                💡 Complete some study sessions
                with productivity scores to
                generate your personalized
                productivity heatmap.
              </p>
            )}

          </div>
        </>
      )}

    </div>
  );
}