"use client";

import { TrendingUp } from "lucide-react";

import useAnalytics, {
  getSessionDate,
  getProductivity,
} from "../useAnalytics";

export default function MomentumScore() {
  const {
    sessions,
    loading,
  } = useAnalytics();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">
        <p className="text-gray-500 text-sm">
          Momentum Score
        </p>

        <div className="mt-4 h-12 w-24 bg-gray-100 rounded-xl animate-pulse" />

        <div className="mt-6 h-3 bg-gray-100 rounded-full animate-pulse" />
      </div>
    );
  }

  const scoredSessions =
    sessions.filter(
      (session) => {
        const score =
          getProductivity(session);

        return (
          score > 0 &&
          score <= 10 &&
          getSessionDate(
            session
          ) !== null
        );
      }
    );

  if (
    scoredSessions.length === 0
  ) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-gray-500 text-sm">
              Momentum Score
            </p>

            <h2 className="text-5xl font-bold mt-2">
              0
            </h2>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
            <TrendingUp
              className="text-green-600"
              size={30}
            />
          </div>

        </div>

        <p className="text-gray-500 mt-6">
          Complete study sessions with productivity
          scores to calculate momentum.
        </p>

      </div>
    );
  }

  const sorted = [
    ...scoredSessions,
  ].sort((a, b) => {
    const dateA =
      getSessionDate(
        a
      )?.getTime() ?? 0;

    const dateB =
      getSessionDate(
        b
      )?.getTime() ?? 0;

    return dateB - dateA;
  });

  const recent =
    sorted.slice(
      0,
      Math.min(
        7,
        sorted.length
      )
    );

  const older =
    sorted.slice(
      7,
      Math.min(
        14,
        sorted.length
      )
    );

  const recentAverage =
    recent.reduce(
      (sum, session) =>
        sum +
        getProductivity(
          session
        ),
      0
    ) / recent.length;

  const olderAverage =
    older.length > 0
      ? older.reduce(
          (sum, session) =>
            sum +
            getProductivity(
              session
            ),
          0
        ) / older.length
      : recentAverage;

  /*
   * Count unique study days
   * in the recent sessions.
   */
  const recentDays =
    new Set(
      recent
        .map((session) => {
          const date =
            getSessionDate(
              session
            );

          return date
            ? date.toDateString()
            : null;
        })
        .filter(
          (
            value
          ): value is string =>
            value !== null
        )
    );

  const consistency =
    Math.min(
      100,
      Math.round(
        (recentDays.size /
          7) *
          100
      )
    );

  const focusComponent =
    (recentAverage / 10) *
    100;

  const momentum =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          focusComponent *
            0.6 +
            consistency *
              0.4
        )
      )
    );

  const change =
    older.length > 0
      ? Math.round(
          ((recentAverage -
            olderAverage) /
            Math.max(
              olderAverage,
              1
            )) *
            100
        )
      : 0;

  const trend =
    change > 2
      ? "Improving"
      : change < -2
      ? "Declining"
      : "Stable";

  const consistencyLabel =
    consistency >= 80
      ? "Excellent"
      : consistency >= 60
      ? "Good"
      : "Building";

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-gray-500 text-sm">
            Momentum Score
          </p>

          <h2 className="text-5xl font-bold mt-2">
            {momentum}
          </h2>

          <p
            className={`font-medium mt-2 ${
              change >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {change >= 0
              ? "↑"
              : "↓"}{" "}
            {Math.abs(change)}% from previous sessions
          </p>

        </div>

        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
          <TrendingUp
            className="text-green-600"
            size={30}
          />
        </div>

      </div>

      <div className="mt-8">

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${momentum}%`,
            }}
          />

        </div>

      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div>
          <p className="text-gray-400 text-sm">
            Consistency
          </p>

          <h3 className="font-bold text-lg">
            {consistencyLabel}
          </h3>
        </div>

        <div>
          <p className="text-gray-400 text-sm">
            Trend
          </p>

          <h3 className="font-bold text-lg">
            {trend}
          </h3>
        </div>

      </div>

      <p className="text-xs text-gray-400 mt-6">
        Based on your latest 7 scored sessions
        compared with the previous 7.
      </p>

    </div>
  );
}