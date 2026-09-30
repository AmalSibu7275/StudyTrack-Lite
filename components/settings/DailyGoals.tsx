"use client";

import { Target } from "lucide-react";

export default function DailyGoals() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 h-full">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Target className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            Daily Goals
          </h2>

          <p className="text-sm text-gray-500">
            Set your productivity targets
          </p>
        </div>

      </div>

      {/* Daily Study Goal */}
      <div className="mb-6">

        <div className="flex justify-between mb-2">
          <span className="font-medium">Daily Study Time</span>
          <span className="text-blue-600 font-semibold">
            3 Hours
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="8"
          defaultValue="3"
          className="w-full accent-blue-600"
        />

      </div>

      {/* Weekly Sessions */}
      <div className="mb-6">

        <div className="flex justify-between mb-2">
          <span className="font-medium">
            Weekly Sessions
          </span>

          <span className="text-blue-600 font-semibold">
            20
          </span>
        </div>

        <input
          type="range"
          min="5"
          max="40"
          defaultValue="20"
          className="w-full accent-blue-600"
        />

      </div>

      {/* Focus Score */}

      <div className="mb-6">

        <div className="flex justify-between mb-2">
          <span className="font-medium">
            Focus Score Goal
          </span>

          <span className="text-blue-600 font-semibold">
            90%
          </span>
        </div>

        <input
          type="range"
          min="50"
          max="100"
          defaultValue="90"
          className="w-full accent-blue-600"
        />

      </div>

      {/* Streak */}

      <div>

        <div className="flex justify-between mb-2">

          <span className="font-medium">
            Streak Goal
          </span>

          <span className="text-blue-600 font-semibold">
            30 Days
          </span>

        </div>

        <input
          type="range"
          min="7"
          max="100"
          defaultValue="30"
          className="w-full accent-blue-600"
        />

      </div>

    </div>
  );
}