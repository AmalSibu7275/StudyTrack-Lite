"use client";

import {
  Clock,
  CheckCircle,
  TrendingUp,
  Flame,
} from "lucide-react";

import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "./useAnalytics";

export default function AnalyticsStats() {
  const { sessions, loading } = useAnalytics();

  const totalMinutes = sessions.reduce(
    (sum, session) =>
      sum + getDuration(session),
    0
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  const totalHours = `${hours}h ${minutes}m`;

  const sessionCount = sessions.length;

  const focusScore =
    sessions.length > 0
      ? (
          sessions.reduce(
            (sum, session) =>
              sum +
              getProductivity(session),
            0
          ) / sessions.length
        ).toFixed(1)
      : "0.0";

  /*
   * Calculate streak from actual session dates.
   */
  const uniqueDays = new Set<string>();

  sessions.forEach((session) => {
    const date = getSessionDate(session);

    if (!date) return;

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    uniqueDays.add(day.toDateString());
  });

  const sortedDays = Array.from(uniqueDays)
    .map((day) => new Date(day))
    .sort(
      (a, b) =>
        b.getTime() - a.getTime()
    );

  let streak = 0;

  if (sortedDays.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newest = sortedDays[0];

    const daysSinceNewest = Math.floor(
      (today.getTime() -
        newest.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    /*
     * A streak is still active if the latest
     * study day is today or yesterday.
     */
    if (daysSinceNewest <= 1) {
      let expectedDate = new Date(
        newest
      );

      for (const day of sortedDays) {
        const diff = Math.round(
          (expectedDate.getTime() -
            day.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (diff === 0) {
          streak++;
          expectedDate.setDate(
            expectedDate.getDate() - 1
          );
        } else {
          break;
        }
      }
    }
  }

  const cards = [
    {
      title: "Total Study Time",
      value: loading
        ? "..."
        : totalHours,
      icon: Clock,
      color:
        "bg-blue-100 text-blue-600",
    },
    {
      title: "Sessions Completed",
      value: loading
        ? "..."
        : sessionCount,
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-600",
    },
    {
      title: "Avg Focus Score",
      value: loading
        ? "..."
        : `${focusScore}/10`,
      icon: TrendingUp,
      color:
        "bg-purple-100 text-purple-600",
    },
    {
      title: "Current Streak",
      value: loading
        ? "..."
        : `${streak} days`,
      icon: Flame,
      color:
        "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {card.value}
                </h2>
              </div>

              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}
              >
                <Icon size={26} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}