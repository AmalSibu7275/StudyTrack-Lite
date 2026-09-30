"use client";

import {
  Brain,
  Flame,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";

import useInsights from "./useInsights";
import StatCard from "./StatCard";
import CircularProgress from "./CircularProgress";

export default function AISummaryRow() {
  const { sessions } = useInsights();

  const totalSessions = sessions.length;

  const avgFocus =
    totalSessions > 0
      ? sessions.reduce(
          (sum, s) => sum + s.productivityScore,
          0
        ) / totalSessions
      : 0;

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const consistency = Math.min(
    100,
    Math.round((totalSessions / 20) * 100)
  );

  const productivity = Math.round(
    (avgFocus / 10) * 100
  );

  const accuracy =
    totalSessions === 0
      ? 0
      : Math.min(
          100,
          Math.round(80 + totalSessions)
        );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      {/* AI Summary */}

      <div className="xl:col-span-5">

        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white p-8 h-full shadow-lg">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">

              <Brain size={28} />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                AI Study Summary
              </h2>

              <p className="text-blue-100">
                Personalized insights from your study habits
              </p>

            </div>

          </div>

          <div className="space-y-4 text-blue-50 leading-7">

            <p>
              You completed{" "}
              <strong>{totalSessions}</strong> study sessions,
              totaling{" "}
              <strong>
                {(totalMinutes / 60).toFixed(1)} hours
              </strong>.
            </p>

            <p>
              Your average focus score is{" "}
              <strong>{avgFocus.toFixed(1)}/10</strong>,
              showing consistent productivity.
            </p>

            <p>
              Keep maintaining your current schedule and
              continue prioritizing deep work sessions.
            </p>

          </div>

        </div>

      </div>

      {/* Right Cards */}

      <div className="xl:col-span-7">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-full">

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center">

            <CircularProgress
              value={consistency}
              color="#22C55E"
            />

            <h4 className="font-semibold mt-5">
              Consistency
            </h4>

          </div>

          <StatCard
            title="Focus Trend"
            value={`${avgFocus.toFixed(1)}/10`}
            subtitle="Average focus"
            icon={<Flame className="text-orange-500" />}
            color="bg-orange-100"
          />

          <StatCard
            title="Productivity"
            value={`${productivity}%`}
            subtitle="Overall performance"
            icon={<TrendingUp className="text-purple-600" />}
            color="bg-purple-100"
          />

          <StatCard
            title="Accuracy"
            value={`${accuracy}%`}
            subtitle="Prediction confidence"
            icon={<CheckCircle2 className="text-green-600" />}
            color="bg-green-100"
          />

        </div>

      </div>

    </div>
  );
}