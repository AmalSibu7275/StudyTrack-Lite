"use client";

import useInsights from "./useInsights";
import { Sparkles } from "lucide-react";

export default function AIRecommendations() {
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

  const recommendations: string[] = [];

  if (avgFocus < 6) {
    recommendations.push(
      "Take short breaks every 45–60 minutes to improve focus."
    );
  }

  if (avgDuration > 120) {
    recommendations.push(
      "Split long study sessions into smaller blocks."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your study habits look healthy. Keep maintaining consistency."
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <Sparkles className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            AI Recommendations
          </h2>

          <p className="text-sm text-gray-500">
            Personalized suggestions
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {recommendations.map((item, index) => (

          <div
            key={index}
            className="rounded-xl bg-blue-50 p-4"
          >
            {item}
          </div>

        ))}

      </div>

    </div>
  );
}