"use client";

import { Sparkles } from "lucide-react";
import type { Session } from "./useInsights";

interface KeyTakeawayProps {
  sessions: Session[];
  loading?: boolean;
}

export default function KeyTakeaway({
  sessions,
  loading = false,
}: KeyTakeawayProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-5 w-32 bg-blue-100 rounded" />
        </div>

        <div className="h-5 w-full bg-blue-100 rounded" />
        <div className="h-5 w-3/4 bg-blue-100 rounded mt-2" />
      </div>
    );
  }

  const averageScore =
    sessions.length === 0
      ? 0
      : Number(
          (
            sessions.reduce(
              (sum, session) =>
                sum + (Number(session.productivityScore) || 0),
              0
            ) / sessions.length
          ).toFixed(1)
        );

  const longestSession =
    sessions.length === 0
      ? 0
      : Math.max(
          ...sessions.map(
            (session) => Number(session.duration) || 0
          )
        );

  let message =
    "Start tracking more sessions to generate personalized insights.";

  if (sessions.length > 0) {
    if (averageScore >= 8) {
      message =
        "Your study habits are highly effective. Continue prioritizing focused sessions and maintaining your current routine.";
    } else if (averageScore >= 6) {
      message =
        "Your productivity is improving. Try increasing focus during longer sessions and maintaining consistent study times.";
    } else {
      message =
        "Consider shorter focused sessions and improving your study environment to increase productivity.";
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white">
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>

        <h2 className="text-lg font-semibold text-gray-800">
          Key Takeaway
        </h2>
      </div>

      <p className="text-gray-700 leading-relaxed">
        {message}
      </p>

      {sessions.length > 0 && (
        <div className="flex gap-8 mt-5">
          <div>
            <p className="text-xs text-gray-500">
              Average Focus Score
            </p>

            <p className="text-xl font-bold text-gray-800">
              {averageScore}/10
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Longest Session
            </p>

            <p className="text-xl font-bold text-gray-800">
              {longestSession} min
            </p>
          </div>
        </div>
      )}
    </div>
  );
}