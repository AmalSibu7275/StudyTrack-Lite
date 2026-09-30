"use client";

import {
  Calendar,
  Clock,
  Brain,
  BatteryCharging,
} from "lucide-react";

import useAnalytics, {
  getSessionDate,
  getDuration,
  getProductivity,
} from "./useAnalytics";

export default function Timeline() {
  const { sessions, loading } =
    useAnalytics();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            Study Timeline
          </h2>

          <p className="text-gray-500 text-sm">
            Your most recent study activity
          </p>
        </div>

        <span className="text-sm text-gray-400">
          {loading
            ? "..."
            : `${sessions.length} Sessions`}
        </span>
      </div>

      <div className="space-y-5">

        {!loading &&
          sessions.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No study sessions yet.
            </div>
          )}

        {sessions.map((session) => {
          const score =
            getProductivity(session);

          const date =
            getSessionDate(session);

          const scoreColor =
            score >= 8
              ? "bg-green-100 text-green-700"
              : score >= 6
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";

          return (
            <div
              key={session.id}
              className="border rounded-xl p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">

                <div>
                  <h3 className="font-semibold text-lg">
                    {session.subject ||
                      "Study Session"}
                  </h3>

                  <p className="text-gray-500">
                    {session.taskName ||
                      "Study session"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${scoreColor}`}
                >
                  {score}/10
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mt-5 text-sm text-gray-600">

                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  {getDuration(session)} mins
                </div>

                <div className="flex items-center gap-2">
                  <Brain size={16} />
                  {session.sessionType ||
                    "Study"}
                </div>

                <div className="flex items-center gap-2">
                  <BatteryCharging size={16} />
                  {session.energyAfter ||
                    "Not recorded"}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />

                  {date
                    ? date.toLocaleDateString()
                    : "-"}
                </div>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}