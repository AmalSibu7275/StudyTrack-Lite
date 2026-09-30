"use client";

import ProductivityHeatmap from "../ProductivityHeatmap";
import AISummary from "../AISummary";
import Timeline from "../Timeline";
import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "../useAnalytics";

export default function Patterns() {
  const { sessions } = useAnalytics();

  let bestHour = "--";
  let bestDay = "--";
  let averageDuration = 0;

  if (sessions.length > 0) {
    /*
     * Best hour
     */
    const hourScores: Record<
      number,
      number[]
    > = {};

    const dayScores: Record<
      string,
      number[]
    > = {};

    let totalDuration = 0;

    sessions.forEach((session) => {
      const date =
        getSessionDate(session);

      const score =
        getProductivity(session);

      totalDuration +=
        getDuration(session);

      if (!date) return;

      const hour =
        date.getHours();

      if (!hourScores[hour]) {
        hourScores[hour] = [];
      }

      hourScores[hour].push(score);

      const day =
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "long",
          }
        );

      if (!dayScores[day]) {
        dayScores[day] = [];
      }

      dayScores[day].push(score);
    });

    let bestHourScore = -1;

    Object.entries(
      hourScores
    ).forEach(
      ([hour, values]) => {
        const average =
          values.reduce(
            (a, b) => a + b,
            0
          ) / values.length;

        if (
          average > bestHourScore
        ) {
          bestHourScore = average;

          const hourNumber =
            Number(hour);

          const date = new Date();
          date.setHours(
            hourNumber,
            0,
            0,
            0
          );

          bestHour =
            date.toLocaleTimeString(
              "en-US",
              {
                hour: "numeric",
              }
            );
        }
      }
    );

    let bestDayScore = -1;

    Object.entries(
      dayScores
    ).forEach(
      ([day, values]) => {
        const average =
          values.reduce(
            (a, b) => a + b,
            0
          ) / values.length;

        if (
          average > bestDayScore
        ) {
          bestDayScore =
            average;

          bestDay = day;
        }
      }
    );

    averageDuration =
      totalDuration /
      sessions.length;
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7">
          <ProductivityHeatmap />
        </div>

        <div className="lg:col-span-5">
          <AISummary />
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <h3 className="text-lg font-semibold">
            Best Study Time
          </h3>

          <p className="text-4xl font-bold mt-4 text-blue-600">
            {bestHour}
          </p>

          <p className="text-gray-500 mt-3">
            Based on your highest average productivity by start time.
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <h3 className="text-lg font-semibold">
            Best Day
          </h3>

          <p className="text-4xl font-bold mt-4 text-green-600">
            {bestDay}
          </p>

          <p className="text-gray-500 mt-3">
            Your strongest weekday based on average productivity.
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

          <h3 className="text-lg font-semibold">
            Average Session
          </h3>

          <p className="text-4xl font-bold mt-4 text-purple-600">
            {Math.round(
              averageDuration
            ) || 0}{" "}
            min
          </p>

          <p className="text-gray-500 mt-3">
            Your current average study session length.
          </p>

        </div>

      </div>

      <Timeline />

    </div>
  );
}