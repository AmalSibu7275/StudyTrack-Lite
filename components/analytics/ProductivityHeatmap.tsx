"use client";

import useAnalytics, {
  getSessionDate,
  getProductivity,
} from "./useAnalytics";

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const HOURS = [
  "8 AM",
  "10 AM",
  "12 PM",
  "2 PM",
  "4 PM",
  "6 PM",
  "8 PM",
];

export default function ProductivityHeatmap() {
  const { sessions, loading } =
    useAnalytics();

  const totals = Array.from(
    { length: 7 },
    () => Array(7).fill(0)
  );

  const counts = Array.from(
    { length: 7 },
    () => Array(7).fill(0)
  );

  sessions.forEach((session) => {
    const date =
      getSessionDate(session);

    if (!date) return;

    const dayIndex =
      date.getDay() === 0
        ? 6
        : date.getDay() - 1;

    let hourIndex = Math.floor(
      (date.getHours() - 8) / 2
    );

    hourIndex = Math.max(
      0,
      Math.min(6, hourIndex)
    );

    const score =
      getProductivity(session);

    if (score <= 0) return;

    totals[dayIndex][hourIndex] +=
      score;

    counts[dayIndex][hourIndex]++;
  });

  const data = totals.map(
    (row, dayIndex) =>
      row.map(
        (total, hourIndex) => {
          const count =
            counts[dayIndex][
              hourIndex
            ];

          return count === 0
            ? 0
            : Number(
                (
                  total / count
                ).toFixed(1)
              );
        }
      )
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Productivity Heatmap
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Your productivity patterns throughout the week.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Loading productivity data...
        </div>
      ) : (
        <>
          <div className="ml-[52px] grid grid-cols-7 gap-2 mb-2">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="text-[10px] text-gray-400 text-center"
              >
                {hour}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {DAYS.map(
              (day, dayIndex) => (
                <div
                  key={day}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 text-xs text-gray-500">
                    {day}
                  </div>

                  <div className="grid grid-cols-7 gap-2 flex-1">
                    {HOURS.map(
                      (
                        hour,
                        hourIndex
                      ) => {
                        const value =
                          data[
                            dayIndex
                          ][hourIndex];

                        return (
                          <div
                            key={`${day}-${hour}`}
                            title={
                              value > 0
                                ? `${day} ${hour}: ${value}/10`
                                : `${day} ${hour}: No study data`
                            }
                            className={`aspect-square rounded ${getHeatmapColor(
                              value
                            )}`}
                          />
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-6">

        <span className="text-xs text-gray-500">
          Less productive
        </span>

        <div className="flex items-center gap-2">

          <div className="w-4 h-4 rounded bg-gray-100" />
          <div className="w-4 h-4 rounded bg-blue-50" />
          <div className="w-4 h-4 rounded bg-blue-100" />
          <div className="w-4 h-4 rounded bg-blue-300" />
          <div className="w-4 h-4 rounded bg-blue-500" />
          <div className="w-4 h-4 rounded bg-blue-600" />

        </div>

        <span className="text-xs text-gray-500">
          More productive
        </span>

      </div>

    </div>
  );
}

function getHeatmapColor(
  value: number
) {
  if (value === 0) {
    return "bg-gray-100";
  }

  if (value <= 2) {
    return "bg-blue-50";
  }

  if (value <= 4) {
    return "bg-blue-100";
  }

  if (value <= 6) {
    return "bg-blue-300";
  }

  if (value <= 8) {
    return "bg-blue-500";
  }

  return "bg-blue-600";
}