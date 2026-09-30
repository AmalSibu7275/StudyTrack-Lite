"use client";

import TrendChart from "../TrendChart";
import MomentumScore from "./MomentumScore";
import ConsistencyTimeline from "./ConsistencyTimeline";
import FocusEvolution from "./FocusEvolution";

import useAnalytics, {
  getDuration,
  getProductivity,
  getSessionDate,
} from "../useAnalytics";

export default function Trends() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  /*
   * ----------------------------------------
   * SUBJECT TRENDS
   * ----------------------------------------
   */

  const subjectData: Record<
    string,
    {
      minutes: number;
      sessions: number;
      focusTotal: number;
      focusCount: number;
    }
  > = {};

  sessions.forEach((session) => {
    const subject =
      session.subject?.trim() ||
      "Other";

    if (!subjectData[subject]) {
      subjectData[subject] = {
        minutes: 0,
        sessions: 0,
        focusTotal: 0,
        focusCount: 0,
      };
    }

    subjectData[subject].minutes +=
      getDuration(session);

    subjectData[subject].sessions += 1;

    const productivity =
      getProductivity(session);

    if (
      productivity > 0 &&
      productivity <= 10
    ) {
      subjectData[subject].focusTotal +=
        productivity;

      subjectData[subject].focusCount +=
        1;
    }
  });

  const subjects = Object.entries(
    subjectData
  )
    .map(([subject, data]) => ({
      subject,
      minutes: data.minutes,
      sessions: data.sessions,
      averageFocus:
        data.focusCount > 0
          ? data.focusTotal /
            data.focusCount
          : 0,
    }))
    .sort(
      (a, b) =>
        b.minutes - a.minutes
    )
    .slice(0, 6);

  const maxMinutes =
    subjects.length > 0
      ? Math.max(
          subjects[0].minutes,
          1
        )
      : 1;

  /*
   * ----------------------------------------
   * FUTURE PROJECTION
   * ----------------------------------------
   *
   * Uses the user's actual recent study
   * activity.
   *
   * We compare the last 7 days against
   * the previous 7 days and project the
   * next 7 days.
   */

  const now = new Date();

  const currentPeriodStart =
    new Date(now);

  currentPeriodStart.setDate(
    currentPeriodStart.getDate() - 6
  );

  currentPeriodStart.setHours(
    0,
    0,
    0,
    0
  );

  const previousPeriodStart =
    new Date(now);

  previousPeriodStart.setDate(
    previousPeriodStart.getDate() - 13
  );

  previousPeriodStart.setHours(
    0,
    0,
    0,
    0
  );

  const previousPeriodEnd =
    new Date(
      currentPeriodStart
    );

  previousPeriodEnd.setMilliseconds(
    -1
  );

  let currentHours = 0;
  let previousHours = 0;

  let currentFocusTotal = 0;
  let currentFocusCount = 0;

  sessions.forEach((session) => {
    const date =
      getSessionDate(session);

    if (!date) {
      return;
    }

    const duration =
      getDuration(session);

    /*
     * Current 7 days
     */
    if (
      date >= currentPeriodStart &&
      date <= now
    ) {
      currentHours +=
        duration / 60;

      const productivity =
        getProductivity(session);

      if (
        productivity > 0 &&
        productivity <= 10
      ) {
        currentFocusTotal +=
          productivity;

        currentFocusCount += 1;
      }

      return;
    }

    /*
     * Previous 7 days
     */
    if (
      date >= previousPeriodStart &&
      date <= previousPeriodEnd
    ) {
      previousHours +=
        duration / 60;
    }
  });

  const weeklyChange =
    previousHours > 0
      ? ((currentHours -
          previousHours) /
          previousHours) *
        100
      : currentHours > 0
      ? 100
      : 0;

  const projectedHours =
    currentHours > 0
      ? currentHours *
        (weeklyChange > 0
          ? 1 +
            Math.min(
              weeklyChange / 100,
              0.5
            )
          : 1)
      : 0;

  const currentAverageFocus =
    currentFocusCount > 0
      ? currentFocusTotal /
        currentFocusCount
      : 0;

  /*
   * ----------------------------------------
   * RENDER
   * ----------------------------------------
   */

  return (
    <div className="space-y-6">

      {/* Main trend chart */}
      <TrendChart />

      {/* Trend cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <MomentumScore />

        <ConsistencyTimeline />

        <FocusEvolution />

      </div>

      {/* Subject + projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Subject Trends */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <div className="flex items-start justify-between gap-4 mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Subject Trends
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Your study time and productivity by subject
              </p>
            </div>

            {!loading && (
              <span className="text-xs text-gray-400">
                {subjects.length} shown
              </span>
            )}

          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading subject trends...
            </div>
          ) : subjects.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                No study data yet.
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Complete some sessions to see your subject trends.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {subjects.map(
                (item) => {
                  const percentage =
                    Math.min(
                      100,
                      Math.max(
                        5,
                        (item.minutes /
                          maxMinutes) *
                          100
                      )
                    );

                  return (
                    <div
                      key={item.subject}
                    >

                      <div className="flex justify-between items-start gap-4 mb-2">

                        <div>
                          <span className="font-medium text-gray-900">
                            {item.subject}
                          </span>

                          <p className="text-xs text-gray-400 mt-1">
                            {item.sessions} session
                            {item.sessions ===
                            1
                              ? ""
                              : "s"}
                            {item.averageFocus >
                            0
                              ? ` • ${item.averageFocus.toFixed(
                                  1
                                )}/10 focus`
                              : ""}
                          </p>
                        </div>

                        <span className="text-gray-500 text-sm whitespace-nowrap">
                          {(
                            item.minutes /
                            60
                          ).toFixed(
                            1
                          )}{" "}
                          hrs
                        </span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">

                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* Future Projection */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-semibold">
              Future Projection
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Projection based on your recent study behavior
            </p>

          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Calculating projection...
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5">

              <p className="font-medium text-gray-700">
                Not enough data yet
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Complete more study sessions to generate a personalized projection.
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {/* Current */}
              <div className="rounded-2xl bg-blue-50 p-5">

                <p className="text-sm text-blue-600">
                  Last 7 days
                </p>

                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {currentHours.toFixed(
                    1
                  )}
                  h
                </p>

              </div>

              {/* Projected */}
              <div className="rounded-2xl bg-purple-50 p-5">

                <div className="flex justify-between items-start">

                  <div>
                    <p className="text-sm text-purple-600">
                      Projected next 7 days
                    </p>

                    <p className="text-3xl font-bold text-purple-700 mt-1">
                      {projectedHours.toFixed(
                        1
                      )}
                      h
                    </p>
                  </div>

                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      weeklyChange > 0
                        ? "bg-green-100 text-green-700"
                        : weeklyChange <
                          0
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {weeklyChange > 0
                      ? "+"
                      : ""}
                    {weeklyChange.toFixed(
                      0
                    )}
                    %
                  </span>

                </div>

              </div>

              {/* Focus */}
              <div className="rounded-2xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Current average focus
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {currentAverageFocus >
                  0
                    ? `${currentAverageFocus.toFixed(
                        1
                      )}/10`
                    : "—"}
                </p>

              </div>

              <p className="text-xs text-gray-400">
                This projection uses your recent 7-day study
                activity compared with the previous 7 days.
                It is a trend estimate, not a prediction of future behavior.
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}