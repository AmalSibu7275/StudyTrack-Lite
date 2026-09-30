"use client";

import useInsights from "./useInsights";
import { BarChart3 } from "lucide-react";

export default function SessionPerformance() {
  const { sessions } = useInsights();

  const types = [
    "Deep Work",
    "Practice",
    "Light Study",
    "Passive Review",
  ];

  const data = types.map((type) => {
    const filtered = sessions.filter(
      (s) => s.sessionType === type
    );

    if (filtered.length === 0) {
      return {
        name: type,
        score: 0,
      };
    }

    const avg =
      filtered.reduce(
        (sum, s) => sum + s.productivityScore,
        0
      ) / filtered.length;

    return {
      name: type,
      score: Number(avg.toFixed(1)),
    };
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
          <BarChart3 className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Session Type Performance
          </h2>

          <p className="text-sm text-gray-500">
            Average focus score by session type
          </p>
        </div>

      </div>

      <div className="space-y-6">

        {data.map((item) => (

          <div key={item.name}>

            <div className="flex justify-between mb-2">

              <span className="font-medium text-gray-700">
                {item.name}
              </span>

              <span className="font-semibold text-blue-600">
                {item.score}/10
              </span>

            </div>

            <div className="w-full h-3 rounded-full bg-gray-100">

              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-700"
                style={{
                  width: `${item.score * 10}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}