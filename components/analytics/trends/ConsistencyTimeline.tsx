"use client";

import useAnalytics, {
  getSessionDate,
} from "../useAnalytics";

type MonthData = {
  start: Date;
  days: Set<string>;
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getDaysInMonth(
  year: number,
  month: number
) {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

function getElapsedDaysInMonth(
  year: number,
  month: number
) {
  const now = new Date();

  if (
    year < now.getFullYear() ||
    (year === now.getFullYear() &&
      month < now.getMonth())
  ) {
    return getDaysInMonth(
      year,
      month
    );
  }

  if (
    year === now.getFullYear() &&
    month === now.getMonth()
  ) {
    return now.getDate();
  }

  return 0;
}

export default function ConsistencyTimeline() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  const monthly: Record<
    string,
    MonthData
  > = {};

  sessions.forEach((session) => {
    const date =
      getSessionDate(session);

    if (!date) {
      return;
    }

    const key =
      getMonthKey(date);

    if (!monthly[key]) {
      monthly[key] = {
        start: new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        ),
        days: new Set<string>(),
      };
    }

    monthly[key].days.add(
      date.toDateString()
    );
  });

  const entries =
    Object.entries(monthly)
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .slice(-12);

  const values = entries.map(
    ([, data]) => {
      const year =
        data.start.getFullYear();

      const month =
        data.start.getMonth();

      const elapsedDays =
        getElapsedDaysInMonth(
          year,
          month
        );

      if (elapsedDays === 0) {
        return 0;
      }

      return Math.min(
        100,
        Math.round(
          (data.days.size /
            elapsedDays) *
            100
        )
      );
    }
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex justify-between items-start mb-8">

        <div>
          <h2 className="text-lg font-semibold">
            Consistency Timeline
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Percentage of days you studied
          </p>
        </div>

        {!loading && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            Live
          </span>
        )}

      </div>

      {loading ? (
        <div className="h-52 flex items-center justify-center text-gray-400">
          Loading consistency...
        </div>
      ) : values.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-gray-400">
          No consistency data yet.
        </div>
      ) : (
        <>
          <div className="flex items-end justify-between h-52 gap-2">

            {values.map(
              (value, index) => (
                <div
                  key={entries[index][0]}
                  className="flex-1 flex items-end justify-center h-full"
                >
                  <div
                    className="w-5 bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      height: `${Math.max(
                        5,
                        value
                      )}%`,
                    }}
                    title={`${entries[index][1].start.toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}: ${value}%`}
                  />
                </div>
              )
            )}

          </div>

          <div className="flex justify-between mt-6 text-xs text-gray-400 gap-2">

            {entries.map(
              ([key, data]) => (
                <span
                  key={key}
                  className="flex-1 text-center"
                >
                  {data.start.toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                    }
                  )}
                </span>
              )
            )}

          </div>
        </>
      )}

    </div>
  );
}