"use client";

import useInsights from "./useInsights";
import { Target } from "lucide-react";

export default function ActionPlan() {
  const { sessions } = useInsights();

  const avgFocus =
    sessions.length > 0
      ? sessions.reduce(
          (sum, s) => sum + s.productivityScore,
          0
        ) / sessions.length
      : 0;

  const avgDuration =
    sessions.length > 0
      ? sessions.reduce(
          (sum, s) => sum + s.duration,
          0
        ) / sessions.length
      : 0;

  const actions: string[] = [];

  if (avgFocus < 6) {
    actions.push("Reduce distractions before each study session.");
  }

  if (avgDuration > 120) {
    actions.push("Break study sessions into 60–90 minute blocks.");
  }

  actions.push("Study at the same time every day.");
  actions.push("Review difficult topics within 24 hours.");
  actions.push("Aim for a focus score above 8.");

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <Target className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Personalized Action Plan
          </h2>

          <p className="text-gray-500">
            Small improvements based on your study history
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {actions.map((action, index) => (

          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50"
          >

            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {index + 1}
            </div>

            <p className="text-gray-700">
              {action}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}