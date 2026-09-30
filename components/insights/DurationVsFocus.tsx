"use client";

import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { TrendingUp } from "lucide-react";
import type { Session } from "./useInsights";

interface DurationVsFocusProps {
  sessions: Session[];
  loading?: boolean;
}

export default function DurationVsFocus({
  sessions,
  loading = false,
}: DurationVsFocusProps) {
  const data = sessions
    .filter(
      (session) =>
        Number.isFinite(Number(session.duration)) &&
        Number.isFinite(Number(session.productivityScore))
    )
    .map((session) => ({
      duration: Number(session.duration),
      focus: Number(session.productivityScore),
    }));

  const averageDuration =
    sessions.length > 0
      ? Math.round(
          sessions.reduce(
            (sum, session) =>
              sum + (Number(session.duration) || 0),
            0
          ) / sessions.length
        )
      : 0;

  const averageFocus =
    sessions.length > 0
      ? (
          sessions.reduce(
            (sum, session) =>
              sum + (Number(session.productivityScore) || 0),
            0
          ) / sessions.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
          <TrendingUp className="text-purple-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Duration vs Focus
          </h2>

          <p className="text-sm text-gray-500">
            Relationship between study length and productivity
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-[320px] rounded-2xl bg-gray-100 animate-pulse" />
      ) : sessions.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center rounded-2xl bg-gray-50 text-sm text-gray-500">
          No sessions available for this date range.
        </div>
      ) : (
        <>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  type="number"
                  dataKey="duration"
                  name="Duration"
                  unit=" min"
                />

                <YAxis
                  type="number"
                  dataKey="focus"
                  domain={[0, 10]}
                  name="Focus"
                />

                <Tooltip />

                <Scatter
                  data={data}
                  fill="#7C3AED"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-purple-50 p-4">
              <p className="text-sm text-gray-500">
                Average Duration
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {averageDuration} min
              </h3>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm text-gray-500">
                Average Focus
              </p>

              <h3 className="text-2xl font-bold mt-1">
                {averageFocus}/10
              </h3>
            </div>
          </div>
        </>
      )}
    </div>
  );
}