"use client";

import { Brain } from "lucide-react";
import type { Session } from "./useInsights";

interface SessionTypeScoresProps {
  sessions: Session[];
  loading?: boolean;
}

const sessionTypes = [
  {
    label: "Deep Work",
    values: ["Deep Work"],
  },
  {
    label: "Practice",
    values: ["Practice"],
  },
  {
    label: "Light Study",
    values: ["Light Study", "Light"],
  },
  {
    label: "Passive",
    values: ["Passive"],
  },
];

export default function SessionTypeScores({
  sessions,
  loading = false,
}: SessionTypeScoresProps) {
  const scores = sessionTypes.map((type) => {
    const filtered = sessions.filter((session) =>
      type.values.includes(session.sessionType)
    );

    const average =
      filtered.length === 0
        ? 0
        : filtered.reduce(
            (sum, session) =>
              sum + (Number(session.productivityScore) || 0),
            0
          ) / filtered.length;

    return {
      label: type.label,
      score: average,
      count: filtered.length,
    };
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Brain className="text-indigo-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Session Scores
          </h2>

          <p className="text-sm text-gray-500">
            Average focus by session type
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5 animate-pulse">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-10" />
              </div>

              <div className="h-3 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {scores.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-2">
                <span>{item.label}</span>

                <span className="font-semibold">
                  {item.score.toFixed(1)}
                </span>
              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(item.score * 10, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}