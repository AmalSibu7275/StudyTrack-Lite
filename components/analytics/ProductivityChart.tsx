"use client";

import { useMemo, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Chart } from "react-chartjs-2";

import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "./useAnalytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type RangeOption =
  | "7d"
  | "30d"
  | "3m"
  | "6m"
  | "year"
  | "all"
  | "custom";

type Bucket = {
  start: Date;
  label: string;
  hours: number;
  scores: number[];
};

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function startOfWeek(date: Date) {
  const result = startOfDay(date);

  const day = result.getDay();

  result.setDate(
    result.getDate() - day
  );

  return result;
}

function startOfMonth(date: Date) {
  const result = startOfDay(date);

  result.setDate(1);

  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(
    result.getDate() + amount
  );
  return result;
}

function addWeeks(date: Date, amount: number) {
  return addDays(date, amount * 7);
}

function addMonths(date: Date, amount: number) {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() + amount
  );

  return result;
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getLabel(
  date: Date,
  grouping: "day" | "week" | "month"
) {
  if (grouping === "day") {
    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  if (grouping === "week") {
    return `Week of ${date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )}`;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  );
}

function differenceInDays(
  start: Date,
  end: Date
) {
  return Math.ceil(
    (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export default function ProductivityChart() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  const [range, setRange] =
    useState<RangeOption>("7d");

  const [customStart, setCustomStart] =
    useState("");

  const [customEnd, setCustomEnd] =
    useState("");

  const {
    chartData,
    totalHours,
    averageFocus,
    rangeLabel,
  } = useMemo(() => {
    const now = new Date();

    let rangeStart: Date;
    let rangeEnd = endOfDay(now);

    let grouping:
      | "day"
      | "week"
      | "month";

    let displayLabel = "";

    /*
     * -----------------------------
     * DETERMINE DATE RANGE
     * -----------------------------
     */
    switch (range) {
      case "7d":
        rangeStart = startOfDay(
          addDays(now, -6)
        );

        grouping = "day";
        displayLabel = "Last 7 Days";
        break;

      case "30d":
        rangeStart = startOfDay(
          addDays(now, -29)
        );

        grouping = "day";
        displayLabel = "Last 30 Days";
        break;

      case "3m":
        rangeStart = startOfDay(
          addMonths(now, -3)
        );

        grouping = "week";
        displayLabel = "Last 3 Months";
        break;

      case "6m":
        rangeStart = startOfDay(
          addMonths(now, -6)
        );

        grouping = "week";
        displayLabel = "Last 6 Months";
        break;

      case "year":
        rangeStart = new Date(
          now.getFullYear(),
          0,
          1
        );

        rangeStart = startOfDay(
          rangeStart
        );

        grouping = "month";
        displayLabel = "This Year";
        break;

      case "all":
        if (sessions.length > 0) {
          const validDates = sessions
            .map((session) =>
              getSessionDate(session)
            )
            .filter(
              (date): date is Date =>
                date !== null
            );

          if (validDates.length > 0) {
            rangeStart = startOfDay(
              new Date(
                Math.min(
                  ...validDates.map(
                    (date) =>
                      date.getTime()
                  )
                )
              )
            );
          } else {
            rangeStart = startOfDay(
              addDays(now, -6)
            );
          }
        } else {
          rangeStart = startOfDay(
            addDays(now, -6)
          );
        }

        /*
         * All-time data is easier to read
         * when grouped by month.
         */
        grouping = "month";
        displayLabel = "All Time";
        break;

      case "custom":
        if (
          customStart &&
          customEnd
        ) {
          rangeStart = startOfDay(
            new Date(
              `${customStart}T00:00:00`
            )
          );

          rangeEnd = endOfDay(
            new Date(
              `${customEnd}T23:59:59`
            )
          );

          const daysBetween =
            differenceInDays(
              rangeStart,
              rangeEnd
            );

          if (daysBetween <= 31) {
            grouping = "day";
          } else if (
            daysBetween <= 180
          ) {
            grouping = "week";
          } else {
            grouping = "month";
          }

          displayLabel = `${customStart} → ${customEnd}`;
        } else {
          rangeStart = startOfDay(
            addDays(now, -6)
          );

          grouping = "day";
          displayLabel =
            "Select a Custom Range";
        }

        break;

      default:
        rangeStart = startOfDay(
          addDays(now, -6)
        );

        grouping = "day";
        displayLabel = "Last 7 Days";
    }

    /*
     * -----------------------------
     * BUILD BUCKETS
     * -----------------------------
     */
    const buckets: Bucket[] = [];

    let cursor = new Date(
      rangeStart
    );

    if (grouping === "day") {
      while (cursor <= rangeEnd) {
        buckets.push({
          start: new Date(cursor),
          label: getLabel(
            cursor,
            "day"
          ),
          hours: 0,
          scores: [],
        });

        cursor = addDays(cursor, 1);
      }
    }

    if (grouping === "week") {
      cursor = startOfWeek(cursor);

      while (cursor <= rangeEnd) {
        buckets.push({
          start: new Date(cursor),
          label: getLabel(
            cursor,
            "week"
          ),
          hours: 0,
          scores: [],
        });

        cursor = addWeeks(cursor, 1);
      }
    }

    if (grouping === "month") {
      cursor = startOfMonth(cursor);

      while (cursor <= rangeEnd) {
        buckets.push({
          start: new Date(cursor),
          label: getLabel(
            cursor,
            "month"
          ),
          hours: 0,
          scores: [],
        });

        cursor = addMonths(cursor, 1);
      }
    }

    /*
     * -----------------------------
     * ADD SESSIONS TO BUCKETS
     * -----------------------------
     */
    sessions.forEach((session) => {
      const date =
        getSessionDate(session);

      if (!date) {
        return;
      }

      if (
        date < rangeStart ||
        date > rangeEnd
      ) {
        return;
      }

      let bucketIndex = -1;

      if (grouping === "day") {
        const key = getDateKey(date);

        bucketIndex =
          buckets.findIndex(
            (bucket) =>
              getDateKey(
                bucket.start
              ) === key
          );
      }

      if (grouping === "week") {
        const key = getDateKey(
          startOfWeek(date)
        );

        bucketIndex =
          buckets.findIndex(
            (bucket) =>
              getDateKey(
                bucket.start
              ) === key
          );
      }

      if (grouping === "month") {
        const key = getMonthKey(date);

        bucketIndex =
          buckets.findIndex(
            (bucket) =>
              getMonthKey(
                bucket.start
              ) === key
          );
      }

      if (bucketIndex === -1) {
        return;
      }

      buckets[bucketIndex].hours +=
        getDuration(session) / 60;

      const score =
        getProductivity(session);

      if (
        score > 0 &&
        score <= 10
      ) {
        buckets[
          bucketIndex
        ].scores.push(score);
      }
    });

    /*
     * -----------------------------
     * PREPARE CHART DATA
     * -----------------------------
     */
    const labels = buckets.map(
      (bucket) =>
        bucket.label
    );

    const hours = buckets.map(
      (bucket) =>
        Number(
          bucket.hours.toFixed(2)
        )
    );

    const focus = buckets.map(
      (bucket) => {
        if (
          bucket.scores.length === 0
        ) {
          return null;
        }

        return Number(
          (
            bucket.scores.reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
            bucket.scores.length
          ).toFixed(1)
        );
      }
    );

    const total = hours.reduce(
      (sum, value) =>
        sum + value,
      0
    );

    const validFocus = focus.filter(
      (
        value
      ): value is number =>
        value !== null
    );

    const average =
      validFocus.length > 0
        ? validFocus.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          validFocus.length
        : 0;

    return {
      chartData: {
        labels,
        datasets: [
          {
            type: "bar" as const,
            label: "Study Hours",
            data: hours,
            backgroundColor:
              "#2563EB",
            borderRadius: 8,
            yAxisID: "y",
          },
          {
            type: "line" as const,
            label: "Focus Score",
            data: focus,
            borderColor:
              "#9333EA",
            backgroundColor:
              "#9333EA",
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: "y1",
            spanGaps: true,
          },
        ],
      },

      totalHours: total,

      averageFocus: average,

      rangeLabel:
        displayLabel,
    };
  }, [
    sessions,
    range,
    customStart,
    customEnd,
  ]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index" as const,
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top" as const,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            const datasetLabel =
              context.dataset
                .label;

            const value =
              context.parsed.y;

            if (
              datasetLabel ===
              "Study Hours"
            ) {
              return ` Study Hours: ${Number(
                value
              ).toFixed(2)}h`;
            }

            return ` Focus Score: ${
              value ?? 0
            }/10`;
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        title: {
          display: true,
          text: "Hours",
        },
      },

      y1: {
        position:
          "right" as const,

        beginAtZero: true,
        min: 0,
        max: 10,

        grid: {
          drawOnChartArea: false,
        },

        title: {
          display: true,
          text: "Focus",
        },
      },
    },
  };

  function applyCustomRange() {
    if (
      !customStart ||
      !customEnd
    ) {
      return;
    }

    const start = new Date(
      `${customStart}T00:00:00`
    );

    const end = new Date(
      `${customEnd}T23:59:59`
    );

    if (start > end) {
      return;
    }

    setRange("custom");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-6">

        <div>
          <h2 className="text-xl font-bold">
            Productivity Over Time
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Study hours vs focus score
          </p>
        </div>

        {/* Range controls */}
        <div className="flex flex-wrap items-center gap-2">

          <select
            value={range}
            onChange={(e) =>
              setRange(
                e.target.value as RangeOption
              )
            }
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="7d">
              Last 7 Days
            </option>

            <option value="30d">
              Last 30 Days
            </option>

            <option value="3m">
              Last 3 Months
            </option>

            <option value="6m">
              Last 6 Months
            </option>

            <option value="year">
              This Year
            </option>

            <option value="all">
              All Time
            </option>

            <option value="custom">
              Custom Range
            </option>
          </select>

        </div>

      </div>

      {/* Custom range */}
      {range === "custom" && (
        <div className="mb-6 rounded-2xl bg-gray-50 border border-gray-200 p-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={customStart}
                onChange={(e) =>
                  setCustomStart(
                    e.target.value
                  )
                }
                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>

              <input
                type="date"
                value={customEnd}
                onChange={(e) =>
                  setCustomEnd(
                    e.target.value
                  )
                }
                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

          </div>

        </div>
      )}

      {/* Chart */}
      <div className="h-[350px]">

        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            Loading analytics...
          </div>
        ) : (
          <Chart
            type="bar"
            data={chartData}
            options={options}
          />
        )}

      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="bg-blue-50 rounded-xl p-4">

          <p className="font-semibold text-blue-700">
            You studied{" "}
            {totalHours.toFixed(1)}h
          </p>

          <p className="text-sm text-blue-600 mt-1">
            {rangeLabel}
          </p>

        </div>

        <div className="bg-purple-50 rounded-xl p-4">

          <p className="font-semibold text-purple-700">
            Average focus{" "}
            {averageFocus > 0
              ? `${averageFocus.toFixed(
                  1
                )}/10`
              : "—"}
          </p>

          <p className="text-sm text-purple-600 mt-1">
            Based on sessions in this range.
          </p>

        </div>

      </div>

    </div>
  );
}