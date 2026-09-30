"use client";

import {
  Brain,
  Target,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import useInsights from "./useInsights";

export default function AISummaryCard() {
  const { sessions } = useInsights();

  const deepSessions = sessions.filter(
    (s) => s.sessionType === "Deep Work"
  ).length;

  const avgFocus =
    sessions.length > 0
      ? (
          sessions.reduce(
            (sum, s) => sum + s.productivityScore,
            0
          ) / sessions.length
        ).toFixed(1)
      : "0.0";

  const consistency =
    Math.min(
      100,
      Math.round((sessions.length / 20) * 100)
    );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

      <div className="grid lg:grid-cols-12 gap-8">

        {/* LEFT */}

        <div className="lg:col-span-7 flex gap-6">

          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shrink-0">

            <Brain
              size={64}
              className="text-purple-600"
            />

          </div>

          <div>

            <h2 className="text-3xl font-bold mb-6">
              Your AI Summary
            </h2>

            <div className="space-y-5 text-gray-700">

              <div className="flex gap-3">

                <Target className="text-blue-600 mt-1" />

                <p>
                  You completed{" "}
                  <strong>{sessions.length}</strong>{" "}
                  study sessions.
                </p>

              </div>

              <div className="flex gap-3">

                <TrendingUp className="text-purple-600 mt-1" />

                <p>
                  Average focus score is{" "}
                  <strong>{avgFocus}/10</strong>.
                </p>

              </div>

              <div className="flex gap-3">

                <CheckCircle2 className="text-green-600 mt-1" />

                <p>
                  <strong>{deepSessions}</strong>{" "}
                  Deep Work sessions completed.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="lg:col-span-5 grid grid-cols-3 gap-4">

          <div className="rounded-2xl border border-gray-100 p-5 text-center">

            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">

              <Target className="text-green-600"/>

            </div>

            <h3 className="text-4xl font-bold mt-5">
              {consistency}
            </h3>

            <p className="text-gray-500 text-sm">
              /100
            </p>

            <p className="mt-4 text-green-600 font-medium">
              Consistency
            </p>

          </div>

          <div className="rounded-2xl border border-gray-100 p-5 text-center">

            <div className="w-12 h-12 rounded-full bg-purple-100 mx-auto flex items-center justify-center">

              <TrendingUp className="text-purple-600"/>

            </div>

            <h3 className="text-4xl font-bold mt-5">
              {avgFocus}
            </h3>

            <p className="text-gray-500 text-sm">
              /10
            </p>

            <p className="mt-4 text-purple-600 font-medium">
              Focus
            </p>

          </div>

          <div className="rounded-2xl border border-gray-100 p-5 text-center">

            <div className="w-12 h-12 rounded-full bg-blue-100 mx-auto flex items-center justify-center">

              <CheckCircle2 className="text-blue-600"/>

            </div>

            <h3 className="text-4xl font-bold mt-5">
              92
            </h3>

            <p className="text-gray-500 text-sm">
              /100
            </p>

            <p className="mt-4 text-blue-600 font-medium">
              Accuracy
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}